import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { adminDb } from "@/lib/firebase-admin";
import type { AddExercisesRequest, GoogleCalendarToken } from "@/types/calendar";

/**
 * Parse frequency string into RRULE + occurrence count per week.
 * Supports: "Daily", "5x per week", "4x per week", "3x per week",
 *           "2x per week", "Twice per week", "Weekly", "1x per week"
 */
function frequencyToRRule(freq: string, weeks: number): string {
  const lower = freq.toLowerCase().replace(/\s+/g, " ").trim();

  // Daily
  if (lower === "daily" || lower.includes("every day") || lower.includes("7x")) {
    return `RRULE:FREQ=DAILY;COUNT=${weeks * 7}`;
  }

  // 6x per week
  if (lower.includes("6x") || lower.includes("6 times")) {
    return `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA;COUNT=${weeks * 6}`;
  }

  // 5x per week
  if (lower.includes("5x") || lower.includes("5 times")) {
    return `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;COUNT=${weeks * 5}`;
  }

  // 4x per week
  if (lower.includes("4x") || lower.includes("4 times")) {
    return `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,TH,FR;COUNT=${weeks * 4}`;
  }

  // 3x per week
  if (lower.includes("3x") || lower.includes("3 times") || lower.includes("three")) {
    return `RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=${weeks * 3}`;
  }

  // 2x per week / twice
  if (lower.includes("2x") || lower.includes("2 times") || lower.includes("twice")) {
    return `RRULE:FREQ=WEEKLY;BYDAY=TU,TH;COUNT=${weeks * 2}`;
  }

  // Weekly / 1x per week
  if (lower.includes("weekly") || lower.includes("1x") || lower.includes("once")) {
    return `RRULE:FREQ=WEEKLY;COUNT=${weeks}`;
  }

  // Fallback: try to extract number from string like "5 per week"
  const match = lower.match(/(\d+)\s*(?:x|times)?\s*(?:per|\/|a)?\s*week/);
  if (match) {
    const n = parseInt(match[1], 10);
    const dayMap: Record<number, string> = {
      1: "MO",
      2: "TU,TH",
      3: "MO,WE,FR",
      4: "MO,TU,TH,FR",
      5: "MO,TU,WE,TH,FR",
      6: "MO,TU,WE,TH,FR,SA",
      7: "MO,TU,WE,TH,FR,SA,SU",
    };
    const days = dayMap[Math.min(n, 7)] || "MO,WE,FR";
    return `RRULE:FREQ=WEEKLY;BYDAY=${days};COUNT=${weeks * Math.min(n, 7)}`;
  }

  // Default: daily for the given weeks
  return `RRULE:FREQ=DAILY;COUNT=${weeks * 7}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: AddExercisesRequest = await request.json();
    const { user_id, exercises, analysis_date, session_id, gait_type, timezone, weeks } = body;

    if (!user_id || !exercises?.length) {
      return NextResponse.json(
        { success: false, error: "Missing user_id or exercises" },
        { status: 400 }
      );
    }

    const durationWeeks = weeks || 4;

    // Load token from Firestore
    const tokenSnap = await adminDb
      .collection("users")
      .doc(user_id)
      .collection("tokens")
      .doc("google_calendar")
      .get();

    if (!tokenSnap.exists) {
      return NextResponse.json(
        { success: false, needs_reauth: true, error: "No calendar token found" },
        { status: 401 }
      );
    }

    const token = tokenSnap.data() as GoogleCalendarToken;

    if (Date.now() >= token.expires_at - 5 * 60 * 1000) {
      return NextResponse.json(
        { success: false, needs_reauth: true, error: "Calendar token expired" },
        { status: 401 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token.access_token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Delete any existing events for this session before creating new ones
    try {
      const existing = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        singleEvents: false,
        maxResults: 500,
      });

      const sessionEvents = (existing.data.items || []).filter(
        (e) => e.description?.includes(`Session: ${session_id}`)
      );

      for (const ev of sessionEvents) {
        if (!ev.id) continue;
        try {
          await calendar.events.delete({ calendarId: "primary", eventId: ev.id });
        } catch {
          // ignore individual delete failures
        }
      }
    } catch (err) {
      console.warn("[calendar/add-exercises] Could not clean up old events:", err);
    }

    // Start day = day after analysis
    const analysisDate = new Date(analysis_date);
    const startDay = new Date(analysisDate);
    startDay.setDate(startDay.getDate() + 1);

    const tz = timezone || "America/New_York";
    const dateStr = `${startDay.getFullYear()}-${String(startDay.getMonth() + 1).padStart(2, "0")}-${String(startDay.getDate()).padStart(2, "0")}`;

    // Fetch existing events for the start day to avoid conflicts
    let busySlots: { startMin: number; endMin: number }[] = [];

    try {
      // Use a wide UTC window to cover any timezone offset
      const windowStart = new Date(`${dateStr}T00:00:00Z`);
      windowStart.setUTCHours(windowStart.getUTCHours() - 14);
      const windowEnd = new Date(`${dateStr}T23:59:59Z`);
      windowEnd.setUTCHours(windowEnd.getUTCHours() + 14);

      const existingEvents = await calendar.events.list({
        calendarId: "primary",
        timeMin: windowStart.toISOString(),
        timeMax: windowEnd.toISOString(),
        timeZone: tz,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 250,
      });

      busySlots = (existingEvents.data.items || [])
        .filter((ev) => ev.start?.dateTime && ev.end?.dateTime)
        .filter((ev) => {
          // Only include events that fall on our target date (in user's timezone)
          const dtStr = ev.start!.dateTime!;
          return dtStr.startsWith(dateStr);
        })
        .map((ev) => {
          // Extract HH:MM directly from dateTime string (already in user's tz)
          const sMatch = ev.start!.dateTime!.match(/T(\d{2}):(\d{2})/);
          const eMatch = ev.end!.dateTime!.match(/T(\d{2}):(\d{2})/);
          const startMin = sMatch ? parseInt(sMatch[1], 10) * 60 + parseInt(sMatch[2], 10) : 0;
          const endMin = eMatch ? parseInt(eMatch[1], 10) * 60 + parseInt(eMatch[2], 10) : 0;
          return { startMin, endMin };
        });
    } catch (err) {
      console.warn("[calendar/add-exercises] Could not fetch existing events for conflict check:", err);
    }

    /**
     * Check if a time slot conflicts with any busy slot.
     * Returns true if the [startMin, startMin+duration) range overlaps any busy slot.
     */
    function hasConflict(startMin: number, duration: number): boolean {
      const endMin = startMin + duration;
      return busySlots.some(
        (slot) => startMin < slot.endMin && endMin > slot.startMin
      );
    }

    /**
     * Find the next available slot starting from preferredMin.
     * Searches in 15-minute increments up to 10 PM (22:00).
     */
    function findFreeSlot(preferredMin: number, duration: number): number {
      let candidate = preferredMin;
      const maxMin = 22 * 60; // Don't schedule past 10 PM
      while (candidate + duration <= maxMin) {
        if (!hasConflict(candidate, duration)) return candidate;
        candidate += 15;
      }
      // If no slot found, return preferred time anyway
      return preferredMin;
    }

    const eventIds: string[] = [];
    const eventLinks: string[] = [];

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const duration = ex.duration_minutes || 30;

      // Use custom start_time from modal, or default stagger
      const time = ex.start_time || `${String(9 + Math.floor(i / 2)).padStart(2, "0")}:${(i % 2) * 30 === 0 ? "00" : "30"}`;
      const [hourStr, minStr] = time.split(":");
      const preferredMin = parseInt(hourStr, 10) * 60 + parseInt(minStr, 10);

      // Find a free slot that doesn't conflict with existing events
      const actualMin = findFreeSlot(preferredMin, duration);
      const hour = Math.floor(actualMin / 60);
      const minute = actualMin % 60;

      const startTime = `${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;

      // Calculate end time from duration_minutes
      const endTotalMin = actualMin + duration;
      const endHour = Math.floor(endTotalMin / 60);
      const endMinute = endTotalMin % 60;
      const endTime = `${dateStr}T${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`;

      // Add this exercise to busy slots so subsequent exercises don't overlap it
      busySlots.push({ startMin: actualMin, endMin: endTotalMin });

      const description = [
        `RecoveryLab Exercise Plan — ${gait_type.replace(/_/g, " ")}`,
        `Session: ${session_id}`,
        "",
        `Instructions:`,
        ...ex.instructions.map((inst, j) => `${j + 1}. ${inst}`),
        "",
        `Sets/Reps: ${ex.sets_reps}`,
        `Frequency: ${ex.frequency}`,
        `Duration: ${durationWeeks} weeks`,
      ].join("\n");

      const rrule = frequencyToRRule(ex.frequency, durationWeeks);

      const event = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `🏋️ ${ex.name}`,
          description,
          start: { dateTime: startTime, timeZone: tz },
          end: { dateTime: endTime, timeZone: tz },
          recurrence: [rrule],
          reminders: {
            useDefault: false,
            overrides: [{ method: "popup", minutes: 10 }],
          },
        },
      });

      if (event.data.id) eventIds.push(event.data.id);
      if (event.data.htmlLink) eventLinks.push(event.data.htmlLink);
    }

    return NextResponse.json({
      success: true,
      event_ids: eventIds,
      event_links: eventLinks,
      count: exercises.length,
    });
  } catch (error) {
    console.error("[calendar/add-exercises] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("401") || message.includes("invalid_grant")) {
      return NextResponse.json(
        { success: false, needs_reauth: true, error: "Token invalid or revoked" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { adminDb } from "@/lib/firebase-admin";
import type { GoogleCalendarToken, CalendarEvent } from "@/types/calendar";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    // Load token from Firestore
    const tokenSnap = await adminDb
      .collection("users")
      .doc(userId)
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

    // Fetch all events in range
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || undefined,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 500,
    });

    const allItems = response.data.items || [];

    // Filter to GaitGuard events — check description and summary with loose matching
    const gaitGuardEvents = allItems.filter((e) => {
      const desc = (e.description || "").toLowerCase();
      const summary = (e.summary || "").toLowerCase();
      return (
        desc.includes("gaitguard") ||
        summary.includes("gaitguard") ||
        summary.includes("\u{1F3CB}") || // 🏋️ dumbbell emoji
        (desc.includes("exercise plan") && desc.includes("session:"))
      );
    });

    const events: CalendarEvent[] = gaitGuardEvents.map((e) => ({
      id: e.id || "",
      summary: e.summary || "",
      description: e.description || "",
      start: e.start?.dateTime || e.start?.date || "",
      end: e.end?.dateTime || e.end?.date || "",
      htmlLink: e.htmlLink || "",
    }));

    console.log(
      `[calendar/events] Found ${allItems.length} total events, ${gaitGuardEvents.length} GaitGuard events`
    );

    return NextResponse.json({
      success: true,
      events,
      debug: { total: allItems.length, filtered: gaitGuardEvents.length },
    });
  } catch (error) {
    console.error("[calendar/events] Error:", error);
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

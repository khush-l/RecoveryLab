import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { adminDb } from "@/lib/firebase-admin";
import type { GoogleCalendarToken } from "@/types/calendar";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { user_id, session_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

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

    // Fetch all future events
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: false,
      maxResults: 500,
    });

    const allItems = response.data.items || [];
    const gaitGuardEvents = allItems.filter((e) => {
      const isGaitGuard =
        e.description?.includes("GaitGuard") || e.summary?.includes("🏋️");
      if (!isGaitGuard) return false;
      // If session_id provided, only match events for that session
      if (session_id) {
        return e.description?.includes(`Session: ${session_id}`);
      }
      return true;
    });

    let deleted = 0;
    for (const event of gaitGuardEvents) {
      if (!event.id) continue;
      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: event.id,
        });
        deleted++;
      } catch (err) {
        console.error(`Failed to delete event ${event.id}:`, err);
      }
    }

    // Clear calendar_sessions records so the "Add to Calendar" button resets
    if (session_id) {
      // Only clear the specific session
      const sessionDoc = adminDb
        .collection("users")
        .doc(user_id)
        .collection("calendar_sessions")
        .doc(session_id);
      const sessionSnap = await sessionDoc.get();
      if (sessionSnap.exists) {
        await sessionDoc.delete();
      }
    } else {
      // Clear all sessions
      const sessionsSnap = await adminDb
        .collection("users")
        .doc(user_id)
        .collection("calendar_sessions")
        .get();

      const batch = adminDb.batch();
      sessionsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      if (sessionsSnap.docs.length > 0) {
        await batch.commit();
      }
    }

    return NextResponse.json({
      success: true,
      deleted,
      message: `Deleted ${deleted} exercise event${deleted !== 1 ? "s" : ""}`,
    });
  } catch (error) {
    console.error("[calendar/delete-exercises] Error:", error);
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

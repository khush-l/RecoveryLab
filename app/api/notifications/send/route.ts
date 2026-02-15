import { NextRequest, NextResponse } from "next/server";
import { broadcastNotification } from "@/lib/notifications-admin";

/**
 * POST /api/notifications/send
 * Broadcast a notification to all applicable family contacts
 *
 * Body: { user_id, type, subject, message }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, type, subject, message } = body;

    if (!user_id || !type || !message) {
      return NextResponse.json(
        { success: false, error: "user_id, type, and message are required" },
        { status: 400 }
      );
    }

    const results = await broadcastNotification({
      userId: user_id,
      type,
      subject: subject || `RecoveryLab: ${type.replace(/_/g, " ")}`,
      message,
    });

    return NextResponse.json({
      success: true,
      sent: results.length,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

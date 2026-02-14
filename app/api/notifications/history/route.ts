import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import type { NotificationRecord } from "@/types/notifications";

const COLLECTION = "notification_history";

/**
 * GET /api/notifications/history?user_id=...&limit=50
 * Get notification history for a user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id query param required" },
        { status: 400 }
      );
    }

    const snap = await adminDb
      .collection(COLLECTION)
      .where("user_id", "==", userId)
      .get();

    const records = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as NotificationRecord)
    );
    records.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return NextResponse.json({
      success: true,
      records: records.slice(0, limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

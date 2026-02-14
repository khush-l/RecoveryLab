import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import type { FamilyContact } from "@/types/notifications";

const COLLECTION = "contacts";

/**
 * GET /api/notifications/contacts?user_id=...
 * List all contacts for a user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id");
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

    const contacts = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as FamilyContact)
    );
    contacts.sort((a, b) => b.created_at.localeCompare(a.created_at));

    return NextResponse.json({ success: true, contacts });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/notifications/contacts
 * Create a new contact
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, name, relationship, phone, email, notifications, channels } = body;

    if (!user_id || !name || !relationship) {
      return NextResponse.json(
        { success: false, error: "user_id, name, and relationship are required" },
        { status: 400 }
      );
    }

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: "At least one of phone or email is required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const contact: Omit<FamilyContact, "id"> = {
      user_id,
      name,
      relationship,
      phone: phone || undefined,
      email: email || undefined,
      notifications: notifications || {
        analysis_update: true,
        weekly_summary: true,
        doctor_flag: true,
      },
      channels: channels || {
        sms: !!phone,
        email: !!email,
      },
      created_at: now,
      updated_at: now,
    };

    // Strip undefined values for Firestore
    const sanitized = JSON.parse(JSON.stringify(contact));
    const docRef = await adminDb.collection(COLLECTION).add(sanitized);

    return NextResponse.json({
      success: true,
      contact: { id: docRef.id, ...sanitized },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

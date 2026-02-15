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
    const { 
      user_id, 
      name, 
      relationship, 
      role, 
      phone, 
      email, 
      organization, 
      license_number, 
      notifications, 
      channels,
      preferences 
    } = body;

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
      role: role || "family",
      phone: phone || undefined,
      email: email || undefined,
      organization: organization || undefined,
      license_number: license_number || undefined,
      notifications: notifications || {
        analysis_update: true,
        weekly_summary: true,
        doctor_flag: true,
        progress_milestone: true,
        exercise_completion: false,
        medical_report: false,
        insurance_update: false,
        appointment_reminder: true,
      },
      channels: channels || {
        sms: !!phone,
        email: !!email,
      },
      preferences: preferences || {
        frequency: "realtime",
        data_access_level: role === "doctor" || role === "physical_therapist" ? "full_medical" : "basic",
      },
      created_at: now,
      updated_at: now,
      welcome_email_sent: false,
    };

    // Strip undefined values for Firestore
    const sanitized = JSON.parse(JSON.stringify(contact));
    const docRef = await adminDb.collection(COLLECTION).add(sanitized);

    const newContact = { id: docRef.id, ...sanitized };

    // Send welcome email if email is provided and channel enabled
    if (email && channels?.email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notifications/send-welcome`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: newContact }),
        });
      } catch (welcomeErr) {
        console.error("[Contacts] Failed to send welcome email:", welcomeErr);
        // Don't fail the contact creation if welcome email fails
      }
    }

    return NextResponse.json({
      success: true,
      contact: newContact,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

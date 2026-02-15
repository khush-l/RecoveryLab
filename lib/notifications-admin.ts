import { adminDb } from "@/lib/firebase-admin";
import { sendPokeMessage } from "@/lib/recoverai/poke";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import type { FamilyContact, NotificationRecord } from "@/types/notifications";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "RecoveryLab <notifications@recoverylab.com>";
const CONTACTS_COLLECTION = "contacts";
const HISTORY_COLLECTION = "notification_history";

/**
 * Fetch contacts that have a specific notification type enabled
 */
export async function getContactsForNotificationType(
  userId: string,
  type: "analysis_update" | "weekly_summary" | "doctor_flag"
): Promise<FamilyContact[]> {
  const snap = await adminDb
    .collection(CONTACTS_COLLECTION)
    .where("user_id", "==", userId)
    .get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as FamilyContact))
    .filter((c) => c.notifications[type]);
}

/**
 * Send a notification to a single contact via the specified channel
 */
export async function sendNotification({
  userId,
  contact,
  type,
  channel,
  subject,
  message,
}: {
  userId: string;
  contact: FamilyContact;
  type: NotificationRecord["type"];
  channel: "sms" | "email";
  subject: string;
  message: string;
}): Promise<NotificationRecord> {
  const now = new Date().toISOString();
  const record: NotificationRecord = {
    id: uuidv4(),
    user_id: userId,
    contact_id: contact.id,
    contact_name: contact.name,
    type,
    channel,
    status: "sent",
    message_preview: message.slice(0, 150),
    created_at: now,
  };

  try {
    if (channel === "sms" && contact.phone) {
      await sendPokeMessage({
        to: contact.phone,
        message,
        metadata: { type, contact_name: contact.name },
      });
    } else if (channel === "email" && contact.email) {
      if (resend) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: contact.email,
          subject,
          text: message,
        });
      } else {
        console.log(`[Notifications] No Resend key — would email ${contact.email}: ${subject}`);
      }
    } else {
      throw new Error(`Missing ${channel === "sms" ? "phone" : "email"} for contact ${contact.name}`);
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    record.status = "failed";
    record.error = errMsg;
    console.error(`[Notifications] Failed to send ${channel} to ${contact.name}:`, errMsg);
  }

  // Log to notification history
  await adminDb.collection(HISTORY_COLLECTION).add(record);
  return record;
}

/**
 * Broadcast a notification to all contacts that have the given type enabled,
 * across all their enabled channels (sms/email).
 */
export async function broadcastNotification({
  userId,
  type,
  subject,
  message,
}: {
  userId: string;
  type: NotificationRecord["type"];
  subject: string;
  message: string;
}): Promise<NotificationRecord[]> {
  const contacts = await getContactsForNotificationType(userId, type);

  if (contacts.length === 0) {
    console.log(`[Notifications] No contacts with ${type} enabled for user ${userId}`);
    return [];
  }

  const results: NotificationRecord[] = [];

  for (const contact of contacts) {
    if (contact.channels.sms && contact.phone) {
      const record = await sendNotification({
        userId,
        contact,
        type,
        channel: "sms",
        subject,
        message,
      });
      results.push(record);
    }

    if (contact.channels.email && contact.email) {
      const record = await sendNotification({
        userId,
        contact,
        type,
        channel: "email",
        subject,
        message,
      });
      results.push(record);
    }
  }

  return results;
}

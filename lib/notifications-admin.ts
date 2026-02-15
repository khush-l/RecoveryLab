import { adminDb } from "@/lib/firebase-admin";
import { sendPokeMessage } from "@/lib/recoverai/poke";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import type { FamilyContact, NotificationRecord, NotificationType } from "@/types/notifications";

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
  type: NotificationType
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
 * Generate HTML email template based on notification type and contact role
 */
function generateEmailHTML(
  contact: FamilyContact,
  type: NotificationType,
  subject: string,
  message: string
): string {
  const iconMap = {
    analysis_update: "📊",
    weekly_summary: "📈",
    doctor_flag: "⚠️",
    progress_milestone: "🎯",
    exercise_completion: "✅",
    medical_report: "🏥",
    insurance_update: "💼",
    appointment_reminder: "📅",
  };

  const colorMap = {
    analysis_update: "#1DB3FB",
    weekly_summary: "#10B981",
    doctor_flag: "#EF4444",
    progress_milestone: "#8B5CF6",
    exercise_completion: "#06B6D4",
    medical_report: "#3B82F6",
    insurance_update: "#F59E0B",
    appointment_reminder: "#EC4899",
  };

  const icon = iconMap[type] || "📬";
  const color = colorMap[type] || "#1DB3FB";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #202020; background: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: ${color}; padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .icon { font-size: 48px; margin-bottom: 10px; }
        .content { padding: 30px; }
        .message { background: #f8f9fa; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #808080; font-size: 12px; border-top: 1px solid #e0e0e0; }
        .badge { display: inline-block; background: #E0F5FF; color: #1DB3FB; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .button { display: inline-block; background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">${icon}</div>
          <h1>${subject}</h1>
          <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">RecoveryLab Update</p>
        </div>
        <div class="content">
          <p>Hello ${contact.name},</p>
          <div class="message">
            ${message.split('\n').map(line => `<p style="margin: 8px 0;">${line}</p>`).join('')}
          </div>
          <p style="color: #808080; font-size: 13px;">
            <span class="badge">${contact.relationship}</span>
            <span class="badge">${contact.role.replace('_', ' ').toUpperCase()}</span>
          </p>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://recoverylab.app'}" class="button">View Full Details</a>
          </div>
        </div>
        <div class="footer">
          <p><strong>RecoveryLab</strong> | AI-Powered Gait Analysis</p>
          <p>You're receiving this because you're listed as a ${contact.relationship.toLowerCase()} contact.</p>
        </div>
      </div>
    </body>
    </html>
  `;
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
  type: NotificationType;
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
    contact_role: contact.role,
    type,
    channel,
    status: "sent",
    message_preview: message.slice(0, 150),
    created_at: now,
    sent_at: now,
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
        const htmlContent = generateEmailHTML(contact, type, subject, message);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: contact.email,
          subject,
          html: htmlContent,
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
  type: NotificationType;
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

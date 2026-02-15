import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDb } from "@/lib/firebase-admin";
import type { FamilyContact } from "@/types/notifications";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "RecoveryLab <notifications@recoverylab.com>";

function getWelcomeEmailTemplate(contact: FamilyContact): { subject: string; html: string; text: string } {
  const roleTemplates = {
    family: {
      subject: "Welcome to RecoveryLab - Stay Connected to Your Loved One's Recovery",
      greeting: `Dear ${contact.name},`,
      intro: `You've been added as a family contact for RecoveryLab, a cutting-edge gait analysis and recovery platform.`,
      body: `
        <p>You'll receive updates about:</p>
        <ul>
          <li><strong>Analysis Results:</strong> When new gait analysis is completed</li>
          <li><strong>Weekly Summaries:</strong> Progress updates and recovery milestones</li>
          <li><strong>Health Alerts:</strong> Important notifications that may require attention</li>
        </ul>
        <p>Your loved one has chosen to keep you informed of their recovery journey. These updates will help you stay connected and provide support when needed.</p>
      `,
    },
    doctor: {
      subject: "RecoveryLab Provider Access - New Patient Monitoring",
      greeting: `Dr. ${contact.name},`,
      intro: `You've been added as a healthcare provider on RecoveryLab for one of your patients.`,
      body: `
        <p>As a verified healthcare provider, you'll have access to:</p>
        <ul>
          <li><strong>Detailed Medical Reports:</strong> Comprehensive gait analysis with clinical metrics</li>
          <li><strong>Progress Tracking:</strong> Weekly summaries and improvement trends</li>
          <li><strong>Health Alerts:</strong> Automatic flags for concerning symptoms or abnormal patterns</li>
          <li><strong>Analysis History:</strong> Complete timeline of gait assessments</li>
        </ul>
        ${contact.organization ? `<p><strong>Organization:</strong> ${contact.organization}</p>` : ""}
        ${contact.license_number ? `<p><strong>License:</strong> ${contact.license_number}</p>` : ""}
        <p>All data is transmitted securely and in compliance with HIPAA regulations.</p>
      `,
    },
    physical_therapist: {
      subject: "RecoveryLab Therapist Portal - New Patient Added",
      greeting: `Hello ${contact.name},`,
      intro: `You've been added as a physical therapist on RecoveryLab for one of your patients.`,
      body: `
        <p>You'll receive:</p>
        <ul>
          <li><strong>Gait Analysis Reports:</strong> Detailed biomechanical assessments</li>
          <li><strong>Exercise Compliance:</strong> Daily exercise completion tracking</li>
          <li><strong>Progress Milestones:</strong> Improvement notifications and recovery goals</li>
          <li><strong>Medical Reports:</strong> Clinical data to inform treatment plans</li>
        </ul>
        ${contact.organization ? `<p><strong>Practice:</strong> ${contact.organization}</p>` : ""}
        <p>This data will help you monitor patient progress between sessions and adjust treatment plans as needed.</p>
      `,
    },
    insurance_provider: {
      subject: "RecoveryLab Insurance Portal Access Granted",
      greeting: `Dear ${contact.name},`,
      intro: `You've been granted access to RecoveryLab patient data for insurance verification and claims processing.`,
      body: `
        <p>You'll receive notifications about:</p>
        <ul>
          <li><strong>Treatment Progress:</strong> Weekly summaries for claims documentation</li>
          <li><strong>Medical Updates:</strong> Relevant health information for case management</li>
          <li><strong>Billing Events:</strong> Treatment milestones that may affect coverage</li>
        </ul>
        ${contact.organization ? `<p><strong>Insurance Provider:</strong> ${contact.organization}</p>` : ""}
        <p>All patient data is de-identified and shared in accordance with insurance regulations and patient consent.</p>
      `,
    },
    caregiver: {
      subject: "RecoveryLab Caregiver Access - Patient Updates",
      greeting: `Hello ${contact.name},`,
      intro: `You've been added as a caregiver on RecoveryLab to help monitor a patient's recovery.`,
      body: `
        <p>You'll be notified about:</p>
        <ul>
          <li><strong>Daily Progress:</strong> Exercise completion and activity levels</li>
          <li><strong>Health Concerns:</strong> Alerts that may require caregiver assistance</li>
          <li><strong>Weekly Summaries:</strong> Overall recovery progress and trends</li>
          <li><strong>Progress Milestones:</strong> Achievements and improvements</li>
        </ul>
        <p>Your role is essential in supporting daily recovery activities and ensuring patient safety.</p>
      `,
    },
    other: {
      subject: "Welcome to RecoveryLab Updates",
      greeting: `Hello ${contact.name},`,
      intro: `You've been added to receive updates from RecoveryLab.`,
      body: `
        <p>You'll receive notifications based on the preferences set by the patient, which may include:</p>
        <ul>
          <li>Analysis results and progress updates</li>
          <li>Weekly recovery summaries</li>
          <li>Important health alerts</li>
        </ul>
      `,
    },
  };

  const template = roleTemplates[contact.role] || roleTemplates.other;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #202020; background: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1DB3FB 0%, #0A95D9 100%); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .content h2 { color: #1DB3FB; font-size: 20px; margin-top: 0; }
        .content p { margin: 15px 0; color: #505050; }
        .content ul { padding-left: 20px; margin: 15px 0; }
        .content li { margin: 8px 0; color: #505050; }
        .cta { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background: #1DB3FB; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .button:hover { background: #0A95D9; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #808080; font-size: 13px; border-top: 1px solid #e0e0e0; }
        .badge { display: inline-block; background: #E0F5FF; color: #1DB3FB; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏃‍♂️ RecoveryLab</h1>
          <p>AI-Powered Gait Analysis & Recovery Platform</p>
        </div>
        <div class="content">
          ${template.greeting}
          <div class="badge">${contact.relationship} • ${contact.role.replace('_', ' ').toUpperCase()}</div>
          <p>${template.intro}</p>
          ${template.body}
          <p><strong>Notification Preferences:</strong></p>
          <ul>
            ${contact.notifications.analysis_update ? '<li>New analysis results</li>' : ''}
            ${contact.notifications.weekly_summary ? '<li>Weekly summaries</li>' : ''}
            ${contact.notifications.doctor_flag ? '<li>Health alerts</li>' : ''}
            ${contact.notifications.progress_milestone ? '<li>Progress milestones</li>' : ''}
            ${contact.notifications.exercise_completion ? '<li>Exercise completion</li>' : ''}
            ${contact.notifications.medical_report ? '<li>Medical reports</li>' : ''}
            ${contact.notifications.insurance_update ? '<li>Insurance updates</li>' : ''}
            ${contact.notifications.appointment_reminder ? '<li>Appointment reminders</li>' : ''}
          </ul>
          <p><strong>Delivery:</strong> ${contact.preferences.frequency === 'realtime' ? 'Real-time' : contact.preferences.frequency === 'daily_digest' ? 'Daily Digest' : 'Weekly Digest'}</p>
        </div>
        <div class="cta">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://recoverylab.app'}" class="button">View Platform</a>
        </div>
        <div class="footer">
          <p><strong>RecoveryLab</strong> | Advanced Gait Analysis</p>
          <p>You're receiving this email because you were added as a contact.</p>
          <p>If you have questions, please contact the patient who added you.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
${template.greeting}

${template.intro}

${template.body.replace(/<[^>]*>/g, '').replace(/&bull;/g, '-')}

Notification Preferences:
${contact.notifications.analysis_update ? '- New analysis results\n' : ''}${contact.notifications.weekly_summary ? '- Weekly summaries\n' : ''}${contact.notifications.doctor_flag ? '- Health alerts\n' : ''}

Delivery: ${contact.preferences.frequency}

Visit RecoveryLab: ${process.env.NEXT_PUBLIC_APP_URL || 'https://recoverylab.app'}

---
RecoveryLab | Advanced Gait Analysis
You're receiving this email because you were added as a contact.
  `.trim();

  return { subject: template.subject, html, text };
}

/**
 * POST /api/notifications/send-welcome
 * Send welcome email to a new contact
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact } = body as { contact: FamilyContact };

    if (!contact || !contact.email) {
      return NextResponse.json(
        { success: false, error: "Contact with email required" },
        { status: 400 }
      );
    }

    if (!resend) {
      console.log("[Welcome Email] No Resend API key - skipping email");
      return NextResponse.json({
        success: false,
        error: "Email service not configured",
      });
    }

    const { subject, html, text } = getWelcomeEmailTemplate(contact);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: contact.email,
      subject,
      html,
      text,
    });

    // Mark welcome email as sent
    await adminDb.collection("contacts").doc(contact.id).update({
      welcome_email_sent: true,
    });

    return NextResponse.json({
      success: true,
      message: "Welcome email sent",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Welcome Email] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

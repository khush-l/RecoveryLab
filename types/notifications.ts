export type ContactRole = 
  | "family" 
  | "doctor" 
  | "physical_therapist" 
  | "insurance_provider" 
  | "caregiver"
  | "other";

export type NotificationType = 
  | "analysis_update"           // New gait analysis completed
  | "weekly_summary"            // Weekly progress summary
  | "doctor_flag"               // Health concern flagged
  | "progress_milestone"        // Improvement milestone reached
  | "exercise_completion"       // Daily exercise completed
  | "medical_report"            // Detailed medical report (for doctors)
  | "insurance_update"          // Updates for insurance claims
  | "appointment_reminder";     // Upcoming appointment

export interface FamilyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  role: ContactRole;
  phone?: string;
  email?: string;
  organization?: string;        // Hospital, clinic, insurance company name
  license_number?: string;      // For medical professionals
  notifications: {
    analysis_update: boolean;
    weekly_summary: boolean;
    doctor_flag: boolean;
    progress_milestone: boolean;
    exercise_completion: boolean;
    medical_report: boolean;
    insurance_update: boolean;
    appointment_reminder: boolean;
  };
  channels: {
    sms: boolean;
    email: boolean;
  };
  preferences: {
    frequency: "realtime" | "daily_digest" | "weekly_digest";
    data_access_level: "basic" | "detailed" | "full_medical";  // What data they can see
  };
  created_at: string;
  updated_at: string;
  welcome_email_sent?: boolean;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  contact_id: string;
  contact_name: string;
  contact_role: ContactRole;
  type: NotificationType;
  channel: "sms" | "email";
  status: "sent" | "failed" | "pending";
  message_preview: string;
  error?: string;
  created_at: string;
  sent_at?: string;
}

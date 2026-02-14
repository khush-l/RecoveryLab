export interface FamilyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  notifications: {
    analysis_update: boolean;
    weekly_summary: boolean;
    doctor_flag: boolean;
  };
  channels: {
    sms: boolean;
    email: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  contact_id: string;
  contact_name: string;
  type: "analysis_update" | "weekly_summary" | "doctor_flag";
  channel: "sms" | "email";
  status: "sent" | "failed";
  message_preview: string;
  error?: string;
  created_at: string;
}

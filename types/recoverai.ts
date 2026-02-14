export interface PatientEvent {
  id: string;
  patient_id: string;
  source: "poke_text" | "poke_scheduled" | "zingage_call" | "vision_analysis" | string;
  type: "checkin" | "symptom" | "weekly_summary" | "flag_doctor" | string;
  payload: Record<string, any>;
  created_at: string; // ISO timestamp
}

export interface AvatarConversation {
  session_id: string;
  user_id: string;
  analysis_id?: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  created_at: string;
  updated_at: string;
}

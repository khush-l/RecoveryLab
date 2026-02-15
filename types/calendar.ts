// Token stored in Firestore at users/{uid}/tokens/google_calendar
export interface GoogleCalendarToken {
  access_token: string;
  expires_at: number; // Unix ms
  scope: string;
  stored_at: number; // Unix ms
}

// Per-exercise schedule sent from the modal
export interface ExerciseSchedule {
  name: string;
  instructions: string[];
  sets_reps: string;
  frequency: string; // "Daily", "5x per week", "3x per week", etc.
  start_time: string; // "09:00", "09:30", etc.
  duration_minutes: number; // estimated or user-set duration
}

// POST /api/calendar/add-exercises request body
export interface AddExercisesRequest {
  user_id: string;
  exercises: ExerciseSchedule[];
  analysis_date: string; // ISO string
  session_id: string;
  gait_type: string;
  timezone: string; // e.g. "America/Chicago"
  weeks: number; // duration in weeks
}

// Calendar event returned from API
export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: string; // ISO datetime
  end: string;
  htmlLink: string;
}

// VLM response — structured output from visual gait analysis (measurement-based)
export interface VLMMeasurements {
  left_arm_swing_range: string;
  right_arm_swing_range: string;
  arm_asymmetry_percent: number;
  left_stride_length: string;
  right_stride_length: string;
  stride_asymmetry_percent: number;
  left_foot_clearance: string;
  right_foot_clearance: string;
  weight_bearing_ratio: string;
  trunk_alignment: string;
}

export interface VLMEvidence {
  frames_showing_pattern: string;
  key_observations: string[];
}

export interface VLMQualityCheck {
  video_quality: string;
  full_body_visible: boolean;
  consistent_view_angle: boolean;
}

export interface NvidiaVLMAnalysis {
  gait_type: string;
  severity_score: number;
  confidence: "high" | "medium" | "low";
  measurements: VLMMeasurements;
  evidence: VLMEvidence;
  why_not_normal: string[];
  affected_side: string;
  quality_check: VLMQualityCheck;
}

// Single exercise from OpenAI coaching response
export interface Exercise {
  name: string;
  target: string;
  instructions: string[];
  sets_reps: string;
  frequency: string;
  form_tips: string[];
}

// OpenAI coaching response — full rehabilitation plan
export interface CoachingPlan {
  explanation: string;
  likely_causes: string[];
  exercises: Exercise[];
  timeline: string;
  warning_signs: string[];
  immediate_tip: string;
}

// Debug information returned alongside responses
export interface DebugInfo {
  grid_preview?: string; // truncated data URL (first 200 chars)
  grid_size_kb?: number;
  vlm_endpoint?: string;
  vlm_model?: string;
  vlm_prompt?: string;
  vlm_raw_response?: string;
  vlm_status?: number;
  vlm_duration_ms?: number;
  coaching_model?: string;
  coaching_prompt?: string;
  coaching_raw_response?: string;
  coaching_duration_ms?: number;
}

// Combined API response returned to the frontend
export interface GaitAnalysisResponse {
  success: boolean;
  session_id: string;
  timestamp: string;
  visual_analysis: NvidiaVLMAnalysis;
  coaching: CoachingPlan;
  error?: string;
  debug?: DebugInfo;
}

// Error response returned when a pipeline stage fails
export interface GaitAnalysisError {
  success: false;
  error: string;
  stage: "upload" | "vlm_analysis" | "coaching" | "unknown";
  debug?: DebugInfo;
}

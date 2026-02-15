/** Shared voice activity detection thresholds used by consultation and mic-test pages. */
export const SPEECH_START_THRESHOLD = 0.20; // 20% RMS to start voice detection
export const SPEECH_STOP_THRESHOLD = 0.10;  // 10% RMS to consider silence
export const SILENCE_DURATION = 1500;       // ms of silence before transcribing

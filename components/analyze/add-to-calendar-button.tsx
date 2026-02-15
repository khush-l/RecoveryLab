"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-context";
import { requestCalendarAccess } from "@/lib/calendar-auth";
import {
  saveCalendarToken,
  getCalendarToken,
  isTokenExpired,
  markSessionScheduled,
  isSessionScheduled,
} from "@/lib/calendar-store";
import type { Exercise } from "@/types/gait-analysis";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  CalendarDays,
  ChevronDown,
  Timer,
} from "lucide-react";

type ButtonState = "idle" | "authorizing" | "adding" | "success" | "error";

interface AddToCalendarButtonProps {
  exercises: Exercise[];
  analysisDate: string;
  sessionId: string;
  gaitType: string;
  timeline?: string;
}

function parseWeeksFromTimeline(timeline?: string): number {
  if (!timeline) return 4;
  const weekMatch = timeline.match(/(\d+)(?:\s*[-–]\s*\d+)?\s*weeks?/i);
  if (weekMatch) return parseInt(weekMatch[1], 10);
  const monthMatch = timeline.match(/(\d+)(?:\s*[-–]\s*\d+)?\s*months?/i);
  if (monthMatch) return parseInt(monthMatch[1], 10) * 4;
  return 4;
}

/**
 * Estimate exercise duration in minutes from sets_reps string.
 * "3 x 12 per side" → 15 min (strength with reps)
 * "3 x 20s per side" → 10 min (stretch/hold)
 * "3 x 10 steps each direction" → 15 min (walking drill)
 * "2 x 30s" → 5 min (quick hold)
 */
function estimateDuration(setsReps: string): number {
  const lower = setsReps.toLowerCase();

  // Extract sets
  const setsMatch = lower.match(/(\d+)\s*x/);
  const sets = setsMatch ? parseInt(setsMatch[1], 10) : 3;

  // Check if it's a timed exercise (seconds)
  const secMatch = lower.match(/(\d+)\s*s(?:ec|econds?)?/);
  if (secMatch) {
    const secs = parseInt(secMatch[1], 10);
    const perSide = lower.includes("side") || lower.includes("each") ? 2 : 1;
    // sets * hold_time * sides + rest between sets (~30s)
    const totalSecs = sets * secs * perSide + (sets - 1) * 30;
    return Math.max(5, Math.ceil(totalSecs / 60) + 2); // +2 min for setup
  }

  // Reps-based exercise
  const repsMatch = lower.match(/(\d+)\s*(?:reps?|steps?|times?)/);
  const reps = repsMatch ? parseInt(repsMatch[1], 10) : 10;
  const perSide = lower.includes("side") || lower.includes("each") || lower.includes("direction") ? 2 : 1;

  // ~3-4 seconds per rep, ~60s rest between sets
  const totalSecs = sets * reps * perSide * 3.5 + (sets - 1) * 60;
  return Math.max(5, Math.ceil(totalSecs / 60) + 2);
}

const FREQUENCY_OPTIONS = [
  "Daily",
  "6x per week",
  "5x per week",
  "4x per week",
  "3x per week",
  "2x per week",
  "Weekly",
];

const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];

function normalizeFrequency(freq: string): string {
  const lower = freq.toLowerCase().trim();
  if (lower === "daily" || lower.includes("every day")) return "Daily";
  if (lower.includes("6x") || lower.includes("6 times")) return "6x per week";
  if (lower.includes("5x") || lower.includes("5 times")) return "5x per week";
  if (lower.includes("4x") || lower.includes("4 times")) return "4x per week";
  if (lower.includes("3x") || lower.includes("3 times") || lower.includes("three")) return "3x per week";
  if (lower.includes("2x") || lower.includes("2 times") || lower.includes("twice")) return "2x per week";
  if (lower.includes("weekly") || lower.includes("1x") || lower.includes("once")) return "Weekly";
  const m = lower.match(/(\d+)\s*(?:x|times)/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 7) return "Daily";
    return `${n}x per week`;
  }
  return "Daily";
}

const TIME_SLOTS: { value: string; label: string }[] = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let h = 5; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const hour12 = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
      slots.push({ value: val, label });
    }
  }
  return slots;
})();

function formatTime12(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour12}:${mStr} ${ampm}`;
}

interface ExerciseConfig {
  name: string;
  instructions: string[];
  sets_reps: string;
  frequency: string;
  start_time: string;
  duration_minutes: number;
}

export default function AddToCalendarButton({
  exercises,
  analysisDate,
  sessionId,
  gaitType,
  timeline,
}: AddToCalendarButtonProps) {
  const { user, hasCalendarAccess, setCalendarAccess } = useAuth();
  const [state, setState] = useState<ButtonState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [eventCount, setEventCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [alreadyScheduled, setAlreadyScheduled] = useState(false);

  useEffect(() => {
    if (user && sessionId) {
      isSessionScheduled(user.uid, sessionId).then(setAlreadyScheduled).catch(() => {});
    }
  }, [user, sessionId]);

  const [openTimeDropdown, setOpenTimeDropdown] = useState<number | null>(null);
  const [openDurationDropdown, setOpenDurationDropdown] = useState<number | null>(null);
  const [weeks, setWeeks] = useState(() => parseWeeksFromTimeline(timeline));
  const [exerciseConfigs, setExerciseConfigs] = useState<ExerciseConfig[]>(() => {
    // Stagger start times based on estimated durations
    let nextMinutes = 9 * 60; // 9:00 AM in minutes
    return exercises.map((ex) => {
      const dur = estimateDuration(ex.sets_reps);
      const h = Math.floor(nextMinutes / 60);
      const m = nextMinutes % 60;
      const startTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      nextMinutes += dur + 5; // 5 min break between exercises
      return {
        name: ex.name,
        instructions: ex.instructions,
        sets_reps: ex.sets_reps,
        frequency: normalizeFrequency(ex.frequency),
        start_time: startTime,
        duration_minutes: dur,
      };
    });
  });

  useEffect(() => setMounted(true), []);

  const updateConfig = (index: number, field: keyof ExerciseConfig, value: string | number) => {
    setExerciseConfigs((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleOpenModal = () => {
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSchedule = async () => {
    if (!user) return;
    setErrorMsg("");

    try {
      let needsAuth = !hasCalendarAccess;

      if (!needsAuth) {
        const token = await getCalendarToken(user.uid);
        if (!token || isTokenExpired(token)) {
          needsAuth = true;
        }
      }

      if (needsAuth) {
        setState("authorizing");
        const { accessToken, expiresIn } = await requestCalendarAccess();
        await saveCalendarToken(user.uid, accessToken, expiresIn);
        setCalendarAccess(true);
      }

      setState("adding");
      const payload = {
        user_id: user.uid,
        exercises: exerciseConfigs.map((c) => ({
          name: c.name,
          instructions: c.instructions,
          sets_reps: c.sets_reps,
          frequency: c.frequency,
          start_time: c.start_time,
          duration_minutes: c.duration_minutes,
        })),
        analysis_date: analysisDate,
        session_id: sessionId,
        gait_type: gaitType,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        weeks,
      };

      const res = await fetch("/api/calendar/add-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.needs_reauth) {
        setState("authorizing");
        const { accessToken, expiresIn } = await requestCalendarAccess();
        await saveCalendarToken(user.uid, accessToken, expiresIn);
        setCalendarAccess(true);

        setState("adding");
        const retryRes = await fetch("/api/calendar/add-exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const retryResult = await retryRes.json();
        if (!retryResult.success) {
          throw new Error(retryResult.error || "Failed to add exercises");
        }
        setEventCount(retryResult.count);
      } else if (!result.success) {
        throw new Error(result.error || "Failed to add exercises");
      } else {
        setEventCount(result.count);
      }

      setState("success");
      setShowModal(false);
      setAlreadyScheduled(true);
      markSessionScheduled(user.uid, sessionId).catch(() => {});
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to add to calendar");
    }
  };

  // Total session time
  const totalMinutes = exerciseConfigs.reduce((sum, c) => sum + c.duration_minutes, 0);

  if (state === "success") {
    return (
      <Button
        variant="modern-outline"
        size="modern-lg"
        className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
        onClick={() => { setAlreadyScheduled(false); setState("idle"); handleOpenModal(); }}
      >
        <CheckCircle2 className="h-4 w-4" />
        {eventCount} Exercises Scheduled
      </Button>
    );
  }

  if (state === "error" && !showModal) {
    return (
      <Button
        variant="modern-outline"
        size="modern-lg"
        className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
        onClick={handleOpenModal}
        title={errorMsg}
      >
        <AlertCircle className="h-4 w-4" />
        Retry Calendar
      </Button>
    );
  }

  const isLoading = state === "authorizing" || state === "adding";

  return (
    <>
      <Button
        variant="modern-outline"
        size="modern-lg"
        onClick={handleOpenModal}
        disabled={isLoading && !showModal}
        className={cn("gap-2", alreadyScheduled && "border-green-200 text-green-700 hover:bg-green-50")}
      >
        {alreadyScheduled ? <CheckCircle2 className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
        {alreadyScheduled ? "Reschedule" : "Add to Calendar"}
      </Button>

      {mounted && showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isLoading && setShowModal(false)} />
          <div className="relative z-10 mx-4 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-[rgba(32,32,32,0.08)] bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(32,32,32,0.06)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#E0F5FF] to-white">
                  <Calendar className="h-5 w-5 text-[#1DB3FB]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#202020]">Schedule Exercises</h3>
                  <p className="text-xs text-[rgba(32,32,32,0.5)]">
                    {totalMinutes} min total &middot; Won&apos;t overlap your existing events
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoading}
                className="rounded-full p-1 text-[rgba(32,32,32,0.4)] hover:bg-gray-100 hover:text-[#202020] disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Duration */}
              <div className="mb-5">
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#202020]">
                  <CalendarDays className="h-3.5 w-3.5 text-[#1DB3FB]" />
                  Duration
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={weeks}
                    onChange={(e) => setWeeks(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
                    className="w-20 rounded-lg border border-[rgba(32,32,32,0.15)] px-3 py-2 text-center text-sm font-semibold text-[#202020] focus:border-[#1DB3FB] focus:outline-none focus:ring-2 focus:ring-[#1DB3FB]/20"
                  />
                  <span className="text-sm text-[rgba(32,32,32,0.55)]">weeks</span>
                  {timeline && (
                    <span className="ml-auto rounded-full bg-[#E0F5FF]/60 px-2.5 py-0.5 text-[11px] font-medium text-[#1DB3FB]">
                      AI recommended
                    </span>
                  )}
                </div>
              </div>

              {/* Exercise list */}
              <div className="space-y-3">
                {exerciseConfigs.map((config, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[rgba(32,32,32,0.06)] bg-[#fafbfc] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#202020] text-[10px] font-bold text-white">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-bold text-[#202020]">{config.name}</span>
                      </div>
                      <span className="text-[11px] text-[rgba(32,32,32,0.4)]">{config.sets_reps}</span>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-3">
                      {/* Time selector */}
                      <div>
                        <label className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[rgba(32,32,32,0.4)]">
                          <Clock className="h-3 w-3" />
                          Start time
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenTimeDropdown(openTimeDropdown === i ? null : i);
                              setOpenDurationDropdown(null);
                            }}
                            className="flex w-full items-center justify-between rounded-lg border border-[rgba(32,32,32,0.1)] bg-white px-3 py-2 text-sm font-medium text-[#202020] transition-colors hover:border-[rgba(32,32,32,0.2)]"
                          >
                            <span>{formatTime12(config.start_time)}</span>
                            <ChevronDown className={cn("h-4 w-4 text-[rgba(32,32,32,0.3)] transition-transform", openTimeDropdown === i && "rotate-180")} />
                          </button>
                          {openTimeDropdown === i && (
                            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[180px] overflow-y-auto rounded-lg border border-[rgba(32,32,32,0.1)] bg-white py-1 shadow-lg">
                              {TIME_SLOTS.map((slot) => (
                                <button
                                  key={slot.value}
                                  type="button"
                                  onClick={() => {
                                    updateConfig(i, "start_time", slot.value);
                                    setOpenTimeDropdown(null);
                                  }}
                                  className={cn(
                                    "flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors",
                                    config.start_time === slot.value
                                      ? "bg-[#E0F5FF] font-semibold text-[#1DB3FB]"
                                      : "text-[#202020] hover:bg-gray-50"
                                  )}
                                >
                                  {slot.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Duration selector */}
                      <div>
                        <label className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[rgba(32,32,32,0.4)]">
                          <Timer className="h-3 w-3" />
                          Duration
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDurationDropdown(openDurationDropdown === i ? null : i);
                              setOpenTimeDropdown(null);
                            }}
                            className="flex w-full items-center justify-between rounded-lg border border-[rgba(32,32,32,0.1)] bg-white px-3 py-2 text-sm font-medium text-[#202020] transition-colors hover:border-[rgba(32,32,32,0.2)]"
                          >
                            <span>{config.duration_minutes} min</span>
                            <ChevronDown className={cn("h-4 w-4 text-[rgba(32,32,32,0.3)] transition-transform", openDurationDropdown === i && "rotate-180")} />
                          </button>
                          {openDurationDropdown === i && (
                            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[180px] overflow-y-auto rounded-lg border border-[rgba(32,32,32,0.1)] bg-white py-1 shadow-lg">
                              {DURATION_OPTIONS.map((dur) => (
                                <button
                                  key={dur}
                                  type="button"
                                  onClick={() => {
                                    updateConfig(i, "duration_minutes", dur);
                                    setOpenDurationDropdown(null);
                                  }}
                                  className={cn(
                                    "flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors",
                                    config.duration_minutes === dur
                                      ? "bg-[#E0F5FF] font-semibold text-[#1DB3FB]"
                                      : "text-[#202020] hover:bg-gray-50"
                                  )}
                                >
                                  {dur} min
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Frequency pill selector */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[rgba(32,32,32,0.4)]">
                        Frequency
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateConfig(i, "frequency", opt)}
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                              config.frequency === opt
                                ? "bg-gradient-to-r from-[#1DB3FB] to-[#84A1FF] text-white shadow-sm"
                                : "border border-[rgba(32,32,32,0.1)] bg-white text-[rgba(32,32,32,0.6)] hover:border-[#1DB3FB]/30 hover:text-[#1DB3FB]"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[rgba(32,32,32,0.06)] px-6 py-4">
              {errorMsg && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="modern-outline"
                  size="modern-lg"
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="modern-primary"
                  size="modern-lg"
                  onClick={handleSchedule}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {state === "authorizing" ? "Connecting..." : "Scheduling..."}
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Schedule {exerciseConfigs.length} Exercises
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

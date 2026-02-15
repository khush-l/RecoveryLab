"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/components/auth-context";
import { getAnalysesForUser, deleteAnalysis, type StoredAnalysis } from "@/lib/analyses-store";
import { getEventsForPatients } from "@/lib/recoverai/store";
import { signOut } from "@/lib/firebase-auth";
import type { PatientEvent } from "@/types/recoverai";
import { Button } from "@/components/ui/button";
import StreaksDisplay from "@/components/streaks-display";
import {
  Activity,
  Calendar,
  ArrowRight,
  LogOut,
  Plus,
  MessageSquare,
  Video,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
  Trash2,
  Loader2,
  X,
} from "lucide-react";

/* ─── Helpers ─── */

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ─── Sub-components ─── */

function SeverityBadge({ score }: { score: number }) {
  let bg = "bg-green-100 text-green-700";
  let label = "Mild";
  if (score >= 7) {
    bg = "bg-red-100 text-red-700";
    label = "Severe";
  } else if (score >= 4) {
    bg = "bg-yellow-100 text-yellow-700";
    label = "Moderate";
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg}`}
    >
      {label} ({score}/10)
    </span>
  );
}

function AnalysisCard({ analysis, onDelete }: { analysis: StoredAnalysis; onDelete: (analysis: StoredAnalysis) => void }) {
  const observations =
    analysis.visual_analysis.visual_observations || [];
  const truncated = observations.slice(0, 2);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[rgba(32,32,32,0.06)] bg-white p-5 shadow-[0px_2px_8px_-2px_rgba(1,65,99,0.08)] transition-all hover:border-[rgba(32,32,32,0.12)] hover:shadow-[0px_4px_16px_-4px_rgba(1,65,99,0.12)]">
      <Link href={`/results/${analysis.id}`} className="flex flex-1 flex-col">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E0F5FF]">
              <Activity className="h-4 w-4 text-[#1DB3FB]" />
            </div>
            <div>
              <p className="text-sm font-bold capitalize text-[#202020]">
                {analysis.visual_analysis.gait_type.replace(/_/g, " ")}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[rgba(32,32,32,0.5)]">
                <Calendar className="h-3 w-3" />
                {formatDate(analysis.timestamp)}
              </div>
            </div>
          </div>
          <SeverityBadge score={analysis.visual_analysis.severity_score} />
        </div>

        {truncated.length > 0 && (
          <ul className="mb-3 flex flex-col gap-1">
            {truncated.map((obs, i) => (
              <li
                key={i}
                className="line-clamp-1 text-xs leading-relaxed text-[rgba(32,32,32,0.65)]"
              >
                &bull; {obs}
              </li>
            ))}
            {observations.length > 2 && (
              <li className="text-xs text-[rgba(32,32,32,0.4)]">
                +{observations.length - 2} more observations
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs font-semibold text-[#1DB3FB] transition-all group-hover:gap-2">
            View full results
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </Link>
      {/* Delete button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(analysis); }}
        className="absolute bottom-4 right-4 rounded-full p-1.5 text-[rgba(32,32,32,0.2)] opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        title="Delete analysis"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function EventIcon({ event }: { event: PatientEvent }) {
  if (event.type === "checkin") {
    return (
      <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <g clipPath="url(#clip0_sms_icon)">
          <rect width="64" height="64" rx="8" fill="#E3F5FF"/>
          <circle cx="46" cy="99" r="90" fill="#75CBFF"/>
          <ellipse cx="45.3906" cy="94" rx="65.5" ry="65" fill="#1DB3FB"/>
          <ellipse cx="45.3906" cy="94" rx="65.5" ry="65" fill="url(#paint0_sms_icon)" fillOpacity="0.55"/>
          <path d="M2.04146 12.2719L43.4825 5.31151C47.2951 4.67115 50.9049 7.24275 51.5453 11.0553L64.4425 87.843C65.0827 91.6555 62.5111 95.2655 58.6986 95.9058L17.2576 102.866C13.4451 103.507 9.83531 100.935 9.19484 97.1224L-3.70237 20.3347C-4.34273 16.5221 -1.77113 12.9123 2.04146 12.2719Z" fill="#75CBFF" stroke="white" strokeWidth="2"/>
          <circle cx="12.4278" cy="19.7391" r="1.99928" transform="rotate(-9.53437 12.4278 19.7391)" fill="white"/>
          <rect x="18.0117" y="16.7744" width="17.3271" height="3.99855" rx="1.99928" transform="rotate(-9.53437 18.0117 16.7744)" fill="white"/>
          <circle cx="28" cy="43" r="18" fill="white"/>
          <rect x="21.8535" y="37.3838" width="2.45374" height="4.90747" rx="1.22687" transform="rotate(-9.43027 21.8535 37.3838)" fill="#00395F"/>
          <rect x="29.1152" y="36.1777" width="2.45374" height="4.90747" rx="1.22687" transform="rotate(-9.43027 29.1152 36.1777)" fill="#00395F"/>
          <path d="M39.2223 43.2657C34.105 50.4215 24.1557 52.074 16.9999 46.9567" stroke="#00395F" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
        <rect x="0.5" y="0.5" width="63" height="63" rx="7.5" stroke="#202020" strokeOpacity="0.04"/>
        <defs>
          <radialGradient id="paint0_sms_icon" cx="0" cy="0" r="1" gradientTransform="matrix(-29.4099 18.0489 -74.4188 -39.1019 19.5137 47.3867)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4258FF"/>
            <stop offset="1" stopColor="#4258FF" stopOpacity="0"/>
          </radialGradient>
          <clipPath id="clip0_sms_icon">
            <rect width="64" height="64" rx="8" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    );
  }
  if (event.type === "weekly_summary") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <BarChart3 className="h-4 w-4 text-blue-600" />
      </div>
    );
  }
  if (event.type === "flag_doctor") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-4 w-4 text-red-600" />
      </div>
    );
  }
  if (event.type === "consultation" || event.source === "zingage_call") {
    return (
      <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <g clipPath="url(#clip0_consult_icon)">
          <rect width="64" height="64" rx="8" fill="#ECF2FF"/>
          <circle cx="-33" cy="-24" r="95" fill="#CEDEFF"/>
          <ellipse cx="-33.6094" cy="-24" rx="65.5" ry="65" fill="#84A1FF"/>
          <ellipse cx="-33.6094" cy="-24" rx="65.5" ry="65" fill="url(#paint0_consult_icon)" fillOpacity="0.55"/>
          <path d="M12.9786 14.8414L44.7951 6.08646C48.5224 5.06108 52.3757 7.25114 53.4014 10.9784L70.1864 71.9768C71.212 75.7041 69.0216 79.5573 65.2944 80.5831L33.478 89.3381C29.7505 90.3638 25.8973 88.1736 24.8717 84.4461L8.08664 23.4478C7.06096 19.7203 9.25117 15.8671 12.9786 14.8414Z" fill="#84A1FF" stroke="white" strokeWidth="2"/>
          <circle cx="21.7121" cy="20.857" r="1.74995" transform="rotate(-15.3854 21.7121 20.857)" fill="white"/>
          <rect x="26.3086" y="17.7771" width="15.1662" height="3.4999" rx="1.74995" transform="rotate(-15.3854 26.3086 17.7771)" fill="white"/>
          <rect x="17.4453" y="39.7078" width="36.502" height="43.3742" rx="4" transform="rotate(-15.3854 17.4453 39.7078)" fill="#ECF2FF"/>
          <path d="M37.6438 38.5385C37.9881 51.9946 30.5437 57.1114 23.7355 57.2857C16.9273 57.4599 11.263 51.9262 11.0839 44.9259C10.9048 37.9256 15.0189 32.2207 21.8271 32.0465C28.6353 31.8723 33.142 37.3566 33.3211 44.3569" stroke="#00395F" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
        <rect x="0.5" y="0.5" width="63" height="63" rx="7.5" stroke="#202020" strokeOpacity="0.04"/>
        <defs>
          <linearGradient id="paint0_consult_icon" x1="2.99999" y1="28" x2="9" y2="-5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3A4EE2"/>
            <stop offset="1" stopColor="#3A4EE2" stopOpacity="0"/>
          </linearGradient>
          <clipPath id="clip0_consult_icon">
            <rect width="64" height="64" rx="8" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
      <MessageSquare className="h-4 w-4 text-gray-500" />
    </div>
  );
}

function eventTitle(event: PatientEvent): string {
  switch (event.type) {
    case "checkin":
      return event.payload?.action === "sms_reminders_enabled"
        ? "SMS Reminders Enabled"
        : "Daily Check-in";
    case "weekly_summary":
      return "Weekly Summary";
    case "flag_doctor":
      return "Flagged for Doctor";
    case "consultation":
      return "AI Consultation";
    default:
      return event.source === "zingage_call"
        ? "AI Consultation"
        : "Recovery Event";
  }
}

function eventDescription(event: PatientEvent): string {
  const p = event.payload || {};
  if (event.type === "consultation") {
    const movementType = p.gait_type?.replace(/_/g, " ") || "movement";
    return `Discussed ${movementType} analysis with AI recovery specialist`;
  }
  if (event.type === "checkin") {
    if (p.action === "sms_reminders_enabled") {
      return `Daily check-in reminders sent to ${p.phone || "your phone"}`;
    }
    const parts: string[] = [];
    if (p.pain !== undefined) parts.push(`Pain: ${p.pain}/10`);
    if (p.did_exercise !== undefined)
      parts.push(p.did_exercise ? "Exercised" : "No exercise");
    if (p.notes) parts.push(p.notes);
    return parts.join(" · ") || "Check-in recorded";
  }
  if (event.type === "weekly_summary") {
    const parts: string[] = [];
    if (p.adherence !== undefined) parts.push(`${p.adherence}% adherence`);
    if (p.avgPain !== undefined)
      parts.push(`Avg pain: ${p.avgPain.toFixed(1)}`);
    return parts.join(" · ") || "Summary generated";
  }
  if (event.type === "flag_doctor") {
    return p.reason || "Concerning symptoms flagged";
  }
  return p.summary || p.notes || "Activity recorded";
}

function hasTranscript(event: PatientEvent): boolean {
  return !!(event.payload?.transcript && event.payload.transcript.length > 0);
}

function ActivityItem({ event, onClick }: { event: PatientEvent; onClick?: () => void }) {
  const clickable = hasTranscript(event);
  return (
    <div
      className={`flex items-start gap-3 py-3 ${clickable ? "cursor-pointer rounded-lg transition-colors hover:bg-[rgba(32,32,32,0.02)]" : ""}`}
      onClick={clickable ? onClick : undefined}
    >
      <EventIcon event={event} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#202020]">
            {eventTitle(event)}
          </p>
          <span className="shrink-0 text-xs text-[rgba(32,32,32,0.45)]">
            {formatDate(event.created_at)}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-[rgba(32,32,32,0.6)]">
          {eventDescription(event)}
        </p>
        {clickable && (
          <p className="mt-1 text-xs font-medium text-[#84A1FF]">
            View transcript
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Empty State SVG ─── */

function EmptyStateIllustration() {
  return (
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E0F5FF]">
      <Activity className="h-7 w-7 text-[#1DB3FB]" />
    </div>
  );
}

/* ─── Main Page ─── */

export default function DashboardPage() {
  const { user, loading, hasCalendarAccess } = useAuth();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [events, setEvents] = useState<PatientEvent[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoredAnalysis | null>(null);
  const [deleteCalendarToo, setDeleteCalendarToo] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transcriptEvent, setTranscriptEvent] = useState<PatientEvent | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    setFetchError(null);
    let cancelled = false;

    (async () => {
      try {
        // 1. Load analyses
        const userAnalyses = await getAnalysesForUser(user.uid);
        if (cancelled) return;
        setAnalyses(userAnalyses);

        // 2. Load recovery events linked to those analyses
        const sessionIds = userAnalyses.map((a) => a.session_id);
        if (sessionIds.length > 0) {
          const patientEvents = await getEventsForPatients(sessionIds);
          if (cancelled) return;
          setEvents(patientEvents);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err instanceof Error ? err.message : String(err);
        console.error("[RecoveryLab] Dashboard fetch error:", err);
        setFetchError(msg);
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  const handleDeleteAnalysis = async () => {
    if (!deleteTarget || !user) return;
    setIsDeleting(true);

    try {
      // Delete calendar events for this session if requested
      if (deleteCalendarToo && hasCalendarAccess) {
        await fetch("/api/calendar/delete-exercises", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.uid, session_id: deleteTarget.session_id }),
        });
      }

      // Delete the analysis from Firestore
      await deleteAnalysis(deleteTarget.id);
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete analysis:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1DB3FB] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header solid />

      <main className="flex-1 px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-[1400px]">
          {/* Dashboard header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-6">
              <div className="shrink-0">
                <h1 className="text-2xl font-bold text-[#202020]">Dashboard</h1>
                <p className="mt-1 text-sm text-[rgba(32,32,32,0.6)]">
                  {user.email}
                </p>
              </div>
              <div className="hidden min-w-0 flex-1 lg:block">
                <StreaksDisplay />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/analyze"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#202020] bg-gradient-to-b from-[#515151] to-[#202020] px-5 text-sm font-semibold text-white shadow-[0_0_1px_3px_#494949_inset,0_6px_5px_0_rgba(0,0,0,0.55)_inset] transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                New Analysis
              </Link>
            </div>
          </div>
          {/* Streaks (mobile/tablet) */}
          <div className="mb-8 lg:hidden">
            <StreaksDisplay />
          </div>

          {/* Content */}
          {fetching ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1DB3FB] border-t-transparent" />
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="mb-2 text-lg font-semibold text-red-800">
                Failed to load data
              </p>
              <p className="mb-1 text-sm text-red-600">{fetchError}</p>
              <p className="text-xs text-red-500">
                Check your Firestore security rules in the Firebase Console.
              </p>
            </div>
          ) : analyses.length === 0 && events.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(32,32,32,0.12)] bg-white/60 py-20 text-center">
              <EmptyStateIllustration />
              <h3 className="mb-2 text-lg font-bold text-[#202020]">
                No analyses yet
              </h3>
              <p className="mb-6 max-w-sm text-sm text-[rgba(32,32,32,0.6)]">
                Upload a video to get your first AI-powered movement
                analysis and personalized exercise plan.
              </p>
              <Link
                href="/analyze"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#202020] bg-gradient-to-b from-[#515151] to-[#202020] px-6 text-sm font-semibold text-white shadow-[0_0_1px_3px_#494949_inset,0_6px_5px_0_rgba(0,0,0,0.55)_inset] transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Start Analysis
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Gait Analyses Section */}
              {analyses.length > 0 && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-[#202020]">
                    Your Analyses
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {analyses.map((analysis) => (
                      <AnalysisCard key={analysis.id} analysis={analysis} onDelete={(a) => { setDeleteTarget(a); setDeleteCalendarToo(true); }} />
                    ))}
                  </div>
                </section>
              )}

              {/* Recovery Activity Section */}
              <section>
                <h2 className="mb-4 text-lg font-bold text-[#202020]">
                  Recovery Activity
                </h2>
                {events.length > 0 ? (
                  <div className="rounded-2xl border border-[rgba(32,32,32,0.06)] bg-white shadow-[0px_2px_8px_-2px_rgba(1,65,99,0.08)]">
                    <div className="divide-y divide-[rgba(32,32,32,0.06)] px-5">
                      {events.slice(0, 20).map((event) => (
                        <ActivityItem
                          key={event.id}
                          event={event}
                          onClick={() => setTranscriptEvent(event)}
                        />
                      ))}
                    </div>
                    {events.length > 20 && (
                      <div className="border-t border-[rgba(32,32,32,0.06)] px-5 py-3 text-center">
                        <span className="text-xs text-[rgba(32,32,32,0.45)]">
                          Showing 20 of {events.length} events
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[rgba(32,32,32,0.1)] bg-white/60 px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-[#202020]">
                      No activity yet
                    </p>
                    <p className="mt-1 text-xs text-[rgba(32,32,32,0.5)]">
                      Start an AI consultation or enable SMS reminders from your
                      analysis results to track your recovery here.
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Delete analysis confirmation modal */}
      {mounted && deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)} />
          <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-[rgba(32,32,32,0.08)] bg-white p-6 shadow-xl">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="absolute right-4 top-4 rounded-full p-1 text-[rgba(32,32,32,0.4)] hover:bg-gray-100 hover:text-[#202020] disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#202020]">Delete Analysis</h3>
            </div>

            <p className="mb-4 text-sm leading-[170%] text-[rgba(32,32,32,0.65)]">
              Are you sure you want to delete this{" "}
              <span className="font-semibold text-[#202020]">
                {deleteTarget.visual_analysis.gait_type.replace(/_/g, " ")}
              </span>{" "}
              analysis from {formatDate(deleteTarget.timestamp)}? This cannot be undone.
            </p>

            {/* Calendar checkbox */}
            {hasCalendarAccess && (
              <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border border-[rgba(32,32,32,0.08)] bg-[rgba(32,32,32,0.02)] p-3">
                <input
                  type="checkbox"
                  checked={deleteCalendarToo}
                  onChange={(e) => setDeleteCalendarToo(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
                />
                <div>
                  <p className="text-sm font-medium text-[#202020]">
                    Also remove calendar exercises
                  </p>
                  <p className="text-xs text-[rgba(32,32,32,0.5)]">
                    Delete any scheduled exercises linked to this analysis from Google Calendar.
                  </p>
                </div>
              </label>
            )}

            <div className="flex gap-3">
              <Button
                variant="modern-outline"
                size="modern-lg"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="modern-primary"
                size="modern-lg"
                onClick={handleDeleteAnalysis}
                disabled={isDeleting}
                className="flex-1 gap-2 border-red-700 bg-red-600 shadow-none hover:bg-red-700 [background-image:none]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Consultation transcript modal */}
      {mounted && transcriptEvent && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setTranscriptEvent(null)} />
          <div className="relative z-10 mx-4 flex w-full max-w-lg flex-col rounded-2xl border border-[rgba(32,32,32,0.08)] bg-white shadow-xl" style={{ maxHeight: "85vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(32,32,32,0.06)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#202020]">Consultation Summary</h3>
                  <p className="text-xs text-[rgba(32,32,32,0.5)]">{formatDate(transcriptEvent.created_at)}</p>
                </div>
              </div>
              <button
                onClick={() => setTranscriptEvent(null)}
                className="rounded-full p-1 text-[rgba(32,32,32,0.4)] hover:bg-gray-100 hover:text-[#202020]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Summary */}
              {transcriptEvent.payload?.summary && (
                <div className="mb-5">
                  <h4 className="mb-2 text-sm font-bold text-[#202020]">Summary</h4>
                  <p className="text-sm leading-relaxed text-[rgba(32,32,32,0.7)]">
                    {transcriptEvent.payload.summary}
                  </p>
                </div>
              )}

              {/* Key Points */}
              {transcriptEvent.payload?.key_points && transcriptEvent.payload.key_points.length > 0 && (
                <div className="mb-5">
                  <h4 className="mb-2 text-sm font-bold text-[#202020]">Key Points</h4>
                  <ul className="space-y-2">
                    {transcriptEvent.payload.key_points.map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-[rgba(32,32,32,0.7)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transcript */}
              {transcriptEvent.payload?.transcript && transcriptEvent.payload.transcript.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-bold text-[#202020]">Full Transcript</h4>
                  <div className="space-y-3">
                    {transcriptEvent.payload.transcript.map((msg: { role: string; content: string }, i: number) => (
                      <div
                        key={i}
                        className={`rounded-lg p-3 ${
                          msg.role === "user" ? "ml-4 bg-blue-50" : "mr-4 bg-gray-50"
                        }`}
                      >
                        <p className="mb-0.5 text-xs font-medium text-[rgba(32,32,32,0.45)]">
                          {msg.role === "user" ? "You" : "Therapist"}
                        </p>
                        <p className="text-sm leading-relaxed text-[rgba(32,32,32,0.75)]">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[rgba(32,32,32,0.06)] px-6 py-4">
              <Button
                variant="modern-outline"
                size="modern-lg"
                onClick={() => setTranscriptEvent(null)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

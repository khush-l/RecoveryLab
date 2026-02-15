"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "./auth-context";

function createRiveDynamic(src: string) {
  return dynamic(
    () =>
      import("@rive-app/react-canvas").then((mod) => {
        const { useRive } = mod;
        function RiveAnim() {
          const { RiveComponent } = useRive({ src, autoplay: true });
          return RiveComponent ? <RiveComponent /> : null;
        }
        return { default: RiveAnim };
      }),
    { ssr: false }
  );
}

const StreakRive = createRiveDynamic("/animations/Streak_1.riv");
const RatingsRive = createRiveDynamic("/animations/Ratings_1.riv");

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_analyses: number;
  last_analysis_date: string | null;
  streak_active: boolean;
}

export default function StreaksDisplay() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStreakData = async () => {
      try {
        const res = await fetch(`/api/streaks?user_id=${user.uid}`);
        const data = await res.json();
        if (data.success) {
          setStreakData(data.streak_data);
        }
      } catch (error) {
        console.error("Error fetching streak data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, [user]);

  if (loading || !streakData) {
    return null;
  }

  const { current_streak, longest_streak, total_analyses, streak_active } = streakData;

  return (
    <div className="flex items-center rounded-full border border-[rgba(32,32,32,0.08)] bg-white shadow-sm">
      {/* Current Streak */}
      <div className="flex flex-1 items-center gap-3 px-5 py-1.5">
        <div className="h-16 w-16 shrink-0">
          <StreakRive />
        </div>
        <div>
          <p className="text-[11px] font-medium text-[rgba(32,32,32,0.45)]">Current Streak</p>
          <p className="text-xl font-bold text-[#202020]">
            {current_streak}
            <span className="ml-1 text-sm font-normal text-[rgba(32,32,32,0.4)]">
              {current_streak === 1 ? "day" : "days"}
            </span>
          </p>
        </div>
      </div>

      <div className="h-10 w-px bg-[rgba(32,32,32,0.06)]" />

      {/* Longest Streak */}
      <div className="flex flex-1 items-center gap-3 px-5 py-1.5">
        <div className="h-16 w-16 shrink-0">
          <RatingsRive />
        </div>
        <div>
          <p className="text-[11px] font-medium text-[rgba(32,32,32,0.45)]">Longest Streak</p>
          <p className="text-xl font-bold text-[#202020]">
            {longest_streak}
            <span className="ml-1 text-sm font-normal text-[rgba(32,32,32,0.4)]">
              {longest_streak === 1 ? "day" : "days"}
            </span>
          </p>
        </div>
      </div>

      <div className="h-10 w-px bg-[rgba(32,32,32,0.06)]" />

      {/* Total Analyses */}
      <div className="flex flex-1 items-center gap-3 px-5 py-1.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-sky-300 to-sky-500 shadow-[0_4px_12px_rgba(56,189,248,0.4),0_2px_4px_rgba(56,189,248,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]">
          <TrendingUp className="h-5 w-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-[rgba(32,32,32,0.45)]">Total Analyses</p>
          <p className="text-xl font-bold text-[#202020]">
            {total_analyses}
            <span className="ml-1 text-sm font-normal text-[rgba(32,32,32,0.4)]">
              {total_analyses === 1 ? "session" : "sessions"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

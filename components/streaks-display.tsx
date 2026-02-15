"use client";

import { useState, useEffect } from "react";
import { Flame, TrendingUp, Award, Calendar } from "lucide-react";
import { useAuth } from "./auth-context";

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Current Streak */}
      <div className="relative overflow-hidden rounded-xl border border-[rgba(32,32,32,0.08)] bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[rgba(32,32,32,0.5)]">Current Streak</p>
            <p className="mt-2 text-3xl font-bold text-[#202020]">
              {current_streak}
              <span className="ml-1 text-lg font-normal text-[rgba(32,32,32,0.4)]">
                {current_streak === 1 ? "day" : "days"}
              </span>
            </p>
            {streak_active && current_streak > 0 && (
              <p className="mt-1 text-xs font-medium text-orange-600">🔥 Keep it going!</p>
            )}
            {!streak_active && current_streak === 0 && (
              <p className="mt-1 text-xs font-medium text-[rgba(32,32,32,0.4)]">
                Start your streak today
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">
            <Flame className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Longest Streak */}
      <div className="relative overflow-hidden rounded-xl border border-[rgba(32,32,32,0.08)] bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[rgba(32,32,32,0.5)]">Longest Streak</p>
            <p className="mt-2 text-3xl font-bold text-[#202020]">
              {longest_streak}
              <span className="ml-1 text-lg font-normal text-[rgba(32,32,32,0.4)]">
                {longest_streak === 1 ? "day" : "days"}
              </span>
            </p>
            {longest_streak > 0 && (
              <p className="mt-1 text-xs font-medium text-violet-600">🏆 Personal best!</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-500 shadow-lg">
            <Award className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Total Analyses */}
      <div className="relative overflow-hidden rounded-xl border border-[rgba(32,32,32,0.08)] bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[rgba(32,32,32,0.5)]">Total Analyses</p>
            <p className="mt-2 text-3xl font-bold text-[#202020]">
              {total_analyses}
              <span className="ml-1 text-lg font-normal text-[rgba(32,32,32,0.4)]">
                {total_analyses === 1 ? "session" : "sessions"}
              </span>
            </p>
            {total_analyses >= 10 && (
              <p className="mt-1 text-xs font-medium text-sky-600">💪 Dedicated!</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-500 shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

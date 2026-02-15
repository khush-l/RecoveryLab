import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_analyses: number;
  last_analysis_date: string | null;
  streak_active: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    const streakData = await calculateStreak(userId);

    return NextResponse.json({
      success: true,
      streak_data: streakData,
    });
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch streak data",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    // Update streak when a new analysis is completed
    await updateStreak(user_id);

    const streakData = await calculateStreak(user_id);

    return NextResponse.json({
      success: true,
      streak_data: streakData,
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update streak",
      },
      { status: 500 }
    );
  }
}

async function calculateStreak(userId: string): Promise<StreakData> {
  // Fetch all analyses from the top-level collection filtered by user_id
  const analysesSnap = await adminDb
    .collection("analyses")
    .where("user_id", "==", userId)
    .orderBy("timestamp", "desc")
    .get();

  if (analysesSnap.empty) {
    return {
      current_streak: 0,
      longest_streak: 0,
      total_analyses: 0,
      last_analysis_date: null,
      streak_active: false,
    };
  }

  const total_analyses = analysesSnap.size;

  // Group analyses by date (YYYY-MM-DD)
  const analysisDates = new Set<string>();
  analysesSnap.docs.forEach((doc) => {
    const timestamp = doc.data().timestamp;
    if (timestamp) {
      const date = new Date(timestamp).toISOString().split("T")[0];
      analysisDates.add(date);
    }
  });

  const sortedDates = Array.from(analysisDates).sort().reverse(); // Most recent first

  if (sortedDates.length === 0) {
    return {
      current_streak: 0,
      longest_streak: 0,
      total_analyses,
      last_analysis_date: null,
      streak_active: false,
    };
  }

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Calculate current streak
  let current_streak = 0;
  let streak_active = false;

  // Check if user analyzed today or yesterday (streak is still active)
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    streak_active = true;
    let expectedDate = new Date(sortedDates[0]);

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);
      const expectedDateStr = expectedDate.toISOString().split("T")[0];

      if (dateStr === expectedDateStr) {
        current_streak++;
        // Move to previous day
        expectedDate = new Date(expectedDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longest_streak = 0;
  let temp_streak = 1;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = new Date(sortedDates[i]);
    const nextDate = new Date(sortedDates[i + 1]);
    const diffDays = Math.floor(
      (currentDate.getTime() - nextDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diffDays === 1) {
      temp_streak++;
    } else {
      longest_streak = Math.max(longest_streak, temp_streak);
      temp_streak = 1;
    }
  }
  longest_streak = Math.max(longest_streak, temp_streak);

  return {
    current_streak,
    longest_streak,
    total_analyses,
    last_analysis_date: sortedDates[0],
    streak_active,
  };
}

async function updateStreak(userId: string): Promise<void> {
  // This function can be called after an analysis is completed
  // It doesn't need to do anything special - calculateStreak handles everything
  // But we could store streak data in a separate document for faster reads if needed
  
  const streakData = await calculateStreak(userId);
  
  // Optionally store in a separate streak document
  await adminDb
    .collection("users")
    .doc(userId)
    .collection("stats")
    .doc("streaks")
    .set({
      ...streakData,
      updated_at: new Date().toISOString(),
    });
}

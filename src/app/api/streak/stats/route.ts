import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get user's streak statistics
export async function GET() {
  try {
    const session = await getServerSession();
  
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: "Unauthorized",
        isDemo: true,
        // Return demo data for non-authenticated users
        weeklyActivity: generateDemoData(7),
        monthlyActivity: generateDemoData(30),
      }, { status: 200 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        streak: {
          include: {
            streakSessions: {
              orderBy: { startTime: "desc" },
              take: 30, // Get last 30 sessions for monthly view
            },
          },
        },
      },
    });

    if (!user?.streak) {
      return NextResponse.json({ 
        error: "No streak data found",
        weeklyActivity: generateDemoData(7),
        monthlyActivity: generateDemoData(30),
      });
    }

    // Process sessions to get daily activity
    const dailyActivity = processSessionsIntoDaily(user.streak.streakSessions);
    
    // Get weekly activity (last 7 days)
    const weeklyActivity = dailyActivity.slice(0, 7);
    
    // Get monthly activity (last 30 days)
    const monthlyActivity = dailyActivity;

    // Calculate statistics
    const totalMinutes = dailyActivity.reduce((sum, day) => sum + day.minutes, 0);
    const averageMinutesPerDay = totalMinutes / dailyActivity.length;
    const totalDays = dailyActivity.filter(day => day.minutes > 0).length;
    const completedDays = dailyActivity.filter(day => day.minutes >= 30).length;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    return NextResponse.json({
      currentStreak: user.streak.currentStreak,
      highestStreak: user.streak.highestStreak,
      totalMinutes,
      averageMinutesPerDay,
      totalDays,
      completedDays,
      completionRate,
      weeklyActivity,
      monthlyActivity,
    });
  } catch (error) {
    console.error("Error in GET /api/streak/stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

type StreakSessionData = {
  id: string;
  startTime: Date | string;
  endTime?: Date | string | null;
  duration: number;
};

// Process sessions into daily activity data
function processSessionsIntoDaily(sessions: StreakSessionData[]) {
  const dailyMap = new Map<string, number>();
  const today = new Date();
  
  // Initialize the last 30 days with 0 minutes
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    dailyMap.set(dateString, 0);
  }
  
  // Fill in actual session data
  sessions.forEach(session => {
    const startDate = new Date(session.startTime);
    const dateString = startDate.toISOString().split('T')[0];
    
    if (dailyMap.has(dateString)) {
      const minutes = session.duration || 0;
      dailyMap.set(dateString, (dailyMap.get(dateString) || 0) + minutes);
    }
  });
  
  // Convert map to array of objects
  const result = Array.from(dailyMap.entries()).map(([date, minutes]) => {
    const dateObj = new Date(date);
    return {
      date,
      day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes,
      goal: Math.min(100, (minutes / 30) * 100), // Goal percentage (visual cap at 100%, but we keep actual minutes)
      actualGoalPercentage: (minutes / 30) * 100, // Actual percentage without capping
    };
  });
  
  // Sort by date (most recent first)
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Generate demo data for non-authenticated users
function generateDemoData(days: number) {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Generate random minutes between 15-45
    const minutes = Math.floor(Math.random() * 30) + 15;
    
    result.push({
      date: dateString,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes,
      goal: Math.min(100, (minutes / 30) * 100),
      actualGoalPercentage: (minutes / 30) * 100, // Thêm trường này để phù hợp với dữ liệu thật
    });
  }
  
  return result;
}

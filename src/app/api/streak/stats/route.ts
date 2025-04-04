import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession();
  
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: "Unauthorized",
        isDemo: true,
        currentStreak: 0,
        highestStreak: 0,
        totalMinutes: 0,
        averageMinutesPerDay: 0,
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
        weeklyActivity: [],
        monthlyActivity: [],
      }, { status: 200 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        streak: {
          include: {
            streakSessions: {
              orderBy: { startTime: "desc" },
              take: 30,
            },
          },
        },
      },
    });

    if (!user?.streak) {
      return NextResponse.json({ 
        error: "No streak data found",
        currentStreak: 0,
        highestStreak: 0,
        totalMinutes: 0,
        averageMinutesPerDay: 0,
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
        weeklyActivity: [],
        monthlyActivity: [],
      });
    }

    const dailyActivity = processSessionsIntoDaily(user.streak.streakSessions, user.streak.todayActiveTime);
    
    const weeklyActivity = dailyActivity.slice(0, 7);
    
    const monthlyActivity = dailyActivity;

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

function processSessionsIntoDaily(sessions: StreakSessionData[], todayActiveTime: number = 0) {
  const dailyMap = new Map<string, number>();
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    dailyMap.set(dateString, 0);
  }
  
  sessions.forEach(session => {
    const startDate = new Date(session.startTime);
    const dateString = startDate.toISOString().split('T')[0];
    
    if (dailyMap.has(dateString)) {
      const minutes = session.duration || 0;
      dailyMap.set(dateString, (dailyMap.get(dateString) || 0) + minutes);
    }
  });
  
  // Thêm thời gian hoạt động hôm nay nếu có
  if (todayActiveTime > 0) {
    const todayString = today.toISOString().split('T')[0];
    const currentValue = dailyMap.get(todayString) || 0;
    
    const updatedValue = Math.max(currentValue, todayActiveTime);
    dailyMap.set(todayString, updatedValue);
  }
  
  const result = Array.from(dailyMap.entries()).map(([date, minutes]) => {
    const dateObj = new Date(date);
    return {
      date,
      day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes,
      goal: Math.min(100, (minutes / 30) * 100),
      actualGoalPercentage: (minutes / 30) * 100,
    };
  });
  
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateDemoData(days: number) {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const minutes = Math.floor(Math.random() * 30) + 15;
    
    result.push({
      date: dateString,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes,
      goal: Math.min(100, (minutes / 30) * 100),
      actualGoalPercentage: (minutes / 30) * 100,
    });
  }
  
  return result;
}

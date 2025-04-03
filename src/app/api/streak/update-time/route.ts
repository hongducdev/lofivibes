import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Update user's activity time
export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { activeTime, sessionId } = await req.json();

    // Validate input
    if (typeof activeTime !== 'number' || !sessionId) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        streak: {
          include: {
            streakSessions: {
              where: { id: sessionId },
            },
          },
        },
      },
    });

    if (!user || !user.streak) {
      return NextResponse.json(
        { error: "User or streak not found" },
        { status: 404 }
      );
    }

    // Check if the session belongs to this user
    const userSession = user.streak.streakSessions.find(s => s.id === sessionId);
    if (!userSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Lấy giá trị hiện tại từ database
    const currentStreak = await prisma.streak.findUnique({
      where: { id: user.streak.id },
      select: { todayActiveTime: true }
    });

    // Chỉ cập nhật nếu giá trị mới lớn hơn giá trị hiện tại
    // Điều này đảm bảo tiến trình không bị giảm khi có nhiều request đồng thời
    const newActiveTime = Math.max(
      currentStreak?.todayActiveTime || 0,
      activeTime
    );

    // Update the streak with today's active time
    await prisma.streak.update({
      where: { id: user.streak.id },
      data: {
        todayActiveTime: newActiveTime,
        lastActivity: new Date(),
      },
    });
    
    // Cập nhật phiên hiện tại với thời gian sử dụng
    await prisma.streakSession.update({
      where: { id: sessionId },
      data: {
        duration: Math.floor(newActiveTime)
      }
    });

    // If user completed 30 minutes, update their stats
    if (activeTime >= 30) {
      // Check if we need to update the highest streak
      const newStreak = user.streak.currentStreak;
      const highestStreak = Math.max(newStreak, user.streak.highestStreak || 0);

      await prisma.streak.update({
        where: { id: user.streak.id },
        data: {
          highestStreak,
          // Don't update current streak here - that happens when a session ends
        },
      });
    }

    // Lấy dữ liệu streak mới nhất sau khi cập nhật
    const updatedStreak = await prisma.streak.findUnique({
      where: { id: user.streak.id },
      include: {
        streakSessions: {
          where: { id: sessionId },
          take: 1
        }
      }
    });
    
    if (!updatedStreak) {
      return NextResponse.json(
        { error: "Failed to retrieve updated streak data" },
        { status: 500 }
      );
    }
    


    return NextResponse.json({ 
      success: true,
      activeTime: updatedStreak.todayActiveTime,
      currentStreak: updatedStreak.currentStreak,
      highestStreak: updatedStreak.highestStreak,
      session: updatedStreak.streakSessions[0] || null
    });
  } catch (error) {
    console.error("Error in POST /api/streak/update-time:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

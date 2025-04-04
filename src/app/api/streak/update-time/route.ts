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
    // Kiểm tra nếu request có body
    const text = await req.text();
    if (!text) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    // Parse JSON an toàn
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse error:", e, "Raw text:", text);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { activeTime, sessionId } = data;

    // Validate input with kiểm tra kỹ lưỡng hơn
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: "Invalid sessionId" },
        { status: 400 }
      );
    }
    
    // Xử lý activeTime một cách an toàn
    let safeActiveTime = 0;
    if (typeof activeTime === 'number' && isFinite(activeTime) && !isNaN(activeTime)) {
      safeActiveTime = Math.max(0, Math.min(activeTime, 1440)); // Giới hạn từ 0 đến 1440 phút (24 giờ)
    } else if (typeof activeTime === 'string') {
      // Cố gắng chuyển đổi từ string sang number nếu có thể
      try {
        const parsedTime = parseFloat(activeTime);
        if (!isNaN(parsedTime) && isFinite(parsedTime)) {
          safeActiveTime = Math.max(0, Math.min(parsedTime, 1440));
        }
      } catch (e) {
        console.error("Error parsing activeTime string:", e);
      }
    }

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

    const MAX_DAILY_MINUTES = 1440; // 24 giờ x 60 phút
    
    // Sử dụng giá trị safeActiveTime đã được xử lý
    const newActiveTime = Math.max(
      currentStreak?.todayActiveTime || 0,
      safeActiveTime
    );
    
    // Giới hạn giá trị cuối cùng
    const finalActiveTime = Math.min(newActiveTime, MAX_DAILY_MINUTES);

    // Update the streak with today's active time
    await prisma.streak.update({
      where: { id: user.streak.id },
      data: {
        todayActiveTime: finalActiveTime,
        lastActivity: new Date(),
      },
    });

    const sessionStartTime = await prisma.streakSession.findUnique({
      where: { id: sessionId },
      select: { startTime: true }
    });
    
    if (sessionStartTime) {
      const startTime = new Date(sessionStartTime.startTime).getTime();
      const now = Date.now();
      const sessionDurationMinutes = Math.floor((now - startTime) / (1000 * 60));
      
      await prisma.streakSession.update({
        where: { id: sessionId },
        data: {
          duration: sessionDurationMinutes
        }
      });
    } else {
      console.error(`Session ${sessionId} not found when updating duration`);
    }

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

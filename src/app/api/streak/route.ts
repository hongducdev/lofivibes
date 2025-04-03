import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Start a new session
export async function POST() {
    const session = await getServerSession();

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { streak: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Create or update streak
        const streak = await prisma.streak.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id },
        });

        // Create new session
        const streakSession = await prisma.streakSession.create({
            data: {
                streakId: streak.id,
            },
        });

        return NextResponse.json({ streakSession });
    } catch (error) {
        console.error("Error in POST /api/streak:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// End a session
export async function PATCH(req: Request) {
    const session = await getServerSession();

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { sessionId } = await req.json();

        const streakSession = await prisma.streakSession.update({
            where: { id: sessionId },
            data: {
                endTime: new Date(),
                duration: 30, // 30 minutes
            },
            include: { streak: true },
        });

        // Update streak count if necessary
        const lastActivity = streakSession.streak.lastActivity;
        const now = new Date();
        const isNewDay = lastActivity.getDate() !== now.getDate();

        if (isNewDay) {
            const daysDiff = Math.floor(
                (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
            );

            await prisma.streak.update({
                where: { id: streakSession.streak.id },
                data: {
                    currentStreak:
                        daysDiff === 1
                            ? streakSession.streak.currentStreak + 1
                            : 1,
                    lastActivity: now,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in PATCH /api/streak:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Get user's streak info
export async function GET() {
    try {
        const session = await getServerSession();
    
        // Nếu không có phiên đăng nhập, trả về dữ liệu mặc định thay vì lỗi 401
        if (!session?.user?.email) {
            console.log("No session found, returning default streak data");
            return NextResponse.json({ 
                currentStreak: 1, 
                activeSession: null,
                isDemo: true
            });
        }
        
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                streak: {
                    include: {
                        streakSessions: {
                            orderBy: { startTime: "desc" },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!user?.streak) {
            return NextResponse.json({ currentStreak: 0, activeSession: null });
        }

        const activeSession = user.streak.streakSessions[0];
        const isSessionActive = activeSession && !activeSession.endTime;

        return NextResponse.json({
            currentStreak: user.streak.currentStreak,
            activeSession: isSessionActive ? activeSession : null,
        });
    } catch (error) {
        console.error("Error in GET /api/streak:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

type StreakSession = {
    id: string;
    startTime: string;
    endTime: string | null;
    duration: number;
};

type StreakInfo = {
    currentStreak: number;
    activeSession: StreakSession | null;
};

export const StreakTracker = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const fetchStreakInfo = async () => {
        const response = await fetch("/api/streak");
        const data = await response.json();
        setStreakInfo(data);

        if (data.activeSession) {
            const startTime = new Date(data.activeSession.startTime).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000 / 60);
            setTimeLeft(Math.max(0, 30 - elapsed));
        }
    };

    const startSession = async () => {
        if (!session) {
            router.push("/auth/signin");
            return;
        }

        await fetch("/api/streak", {
            method: "POST",
        });
        await fetchStreakInfo();
    };

    const endSession = useCallback(async () => {
        if (!streakInfo?.activeSession) return;

        await fetch("/api/streak", {
            method: "PATCH",
            body: JSON.stringify({ sessionId: streakInfo.activeSession.id }),
        });
        await fetchStreakInfo();
    }, [streakInfo, fetchStreakInfo]);

    useEffect(() => {
        if (session) {
            fetchStreakInfo();
        }
    }, [session]);

    useEffect(() => {
        if (!streakInfo?.activeSession || timeLeft === 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    endSession();
                    return 0;
                }
                return prev - 1;
            });
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [streakInfo?.activeSession, timeLeft, endSession]);

    if (!session) {
        return (
            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                <p className="text-center text-gray-600 dark:text-gray-400">
                    Sign in to track your streak
                </p>
                <Button
                    onClick={() => router.push("/auth/signin")}
                    className="mt-2 w-full"
                >
                    Sign In
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
            <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Current Streak
                </h3>
                <p className="mt-1 text-3xl font-bold text-primary">
                    {streakInfo?.currentStreak || 0} days
                </p>
            </div>

            <div className="mt-4">
                {streakInfo?.activeSession ? (
                    <div className="space-y-2">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Time remaining: {timeLeft} minutes
                        </p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{
                                    width: `${(timeLeft / 30) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <Button onClick={startSession} className="w-full">
                        Start 30-minute Session
                    </Button>
                )}
            </div>
        </div>
    );
};

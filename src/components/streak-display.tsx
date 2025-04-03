"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { UserStats } from "@/components/user-stats";

type StreakSession = {
    id: string;
    startTime: string;
    endTime: string | null;
    duration: number;
};

type StreakInfo = {
    currentStreak: number;
    highestStreak?: number;
    activeSession: StreakSession | null;
    lastActiveDay?: string;
    todayActiveTime?: number;
};

const GOAL_MINUTES = 30;

export const StreakDisplay = () => {
    const { data: session } = useSession();
    const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [activeTime, setActiveTime] = useState<number>(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [goalCompleted, setGoalCompleted] = useState(false);
    const [notificationShown, setNotificationShown] = useState(false);
    const lastActivityTime = useRef<number>(Date.now());
    const activityInterval = useRef<NodeJS.Timeout | null>(null);

    const fetchStreakInfo = useRef(async () => {
        try {
            const response = await fetch("/api/streak");

            if (!response.ok) {
                console.warn(
                    `Error fetching streak info: ${response.status} ${response.statusText}`
                );
                setStreakInfo({ currentStreak: 1, activeSession: null });
                return;
            }

            const data = await response.json();
            setStreakInfo(data);

            if (data.activeSession) {
                const activeTimeFromDB = data.todayActiveTime || 0;

                const startTime = new Date(
                    data.activeSession.startTime
                ).getTime();
                const now = Date.now();
                const elapsed = Math.floor((now - startTime) / 1000 / 60);

                // Don't cap the minutes at GOAL_MINUTES to track full usage time
                const minutesUsed = Math.max(activeTimeFromDB, elapsed);

                setActiveTime(minutesUsed);
                setTimeLeft(Math.max(0, GOAL_MINUTES - elapsed));

                if (minutesUsed >= GOAL_MINUTES && !goalCompleted) {
                    setGoalCompleted(true);

                    // Only show notification if it hasn't been shown today
                    const today = new Date().toDateString();
                    const lastNotificationDay = localStorage.getItem(
                        "lastStreakNotificationDay"
                    );

                    if (lastNotificationDay !== today && !notificationShown) {
                        toast.success(
                            "Congratulations! You've completed your 30-minute daily goal!",
                            {
                                duration: 5000,
                            }
                        );
                        localStorage.setItem(
                            "lastStreakNotificationDay",
                            today
                        );
                        setNotificationShown(true);
                    }
                }
            } else {
                setActiveTime(0);
                setGoalCompleted(false);
            }
        } catch (error) {
            console.error("Failed to fetch streak info:", error);
            setStreakInfo({ currentStreak: 1, activeSession: null });
            setActiveTime(0);
        }
    }).current;

    const startSession = useRef(async () => {
        if (!session) {
            return;
        }

        try {
            const response = await fetch("/api/streak", {
                method: "POST",
            });

            if (!response.ok) {
                console.warn(
                    `Error starting streak session: ${response.status} ${response.statusText}`
                );
                return;
            }

            await fetchStreakInfo();
        } catch (error) {
            console.error("Failed to start streak session:", error);
        }
    }).current;

    const endSession = useRef(async () => {
        if (!streakInfo?.activeSession) return;

        try {
            const response = await fetch("/api/streak", {
                method: "PATCH",
                body: JSON.stringify({
                    sessionId: streakInfo.activeSession.id,
                }),
            });

            if (!response.ok) {
                console.warn(
                    `Error ending streak session: ${response.status} ${response.statusText}`
                );
                return;
            }

            await fetchStreakInfo();
        } catch (error) {
            console.error("Failed to end streak session:", error);
        }
    }).current;

    // Check if notification has been shown today
    useEffect(() => {
        const today = new Date().toDateString();
        const lastNotificationDay = localStorage.getItem(
            "lastStreakNotificationDay"
        );
        const notificationShownToday = lastNotificationDay === today;
        setNotificationShown(notificationShownToday);

        // Reset notification state if it's a new day
        if (!notificationShownToday && goalCompleted) {
            setGoalCompleted(false);
        }
    }, [goalCompleted]);

    useEffect(() => {
        if (session) {
            fetchStreakInfo();
            const autoStartSession = async () => {
                const response = await fetch("/api/streak");
                if (response.ok) {
                    const data = await response.json();
                    if (!data.activeSession) {
                        startSession();
                    }
                }
            };
            autoStartSession();
        } else {
            setStreakInfo({ currentStreak: 1, activeSession: null });
            setActiveTime(0);
        }
    }, [session, fetchStreakInfo, startSession]);

    const trackUserActivity = () => {
        const now = Date.now();
        lastActivityTime.current = now;
    };

    useEffect(() => {
        const isSimulationMode = !streakInfo?.activeSession;

        if (isSimulationMode) {
            const testInterval = setInterval(() => {
                setActiveTime((prev) => {
                    // Don't cap the time at GOAL_MINUTES to track full usage
                    const newTime = prev + 1 / 60;
                    return newTime;
                });
            }, 1000);

            return () => clearInterval(testInterval);
        }

        window.addEventListener("mousemove", trackUserActivity);
        window.addEventListener("keydown", trackUserActivity);
        window.addEventListener("click", trackUserActivity);
        window.addEventListener("scroll", trackUserActivity);
        window.addEventListener("touchstart", trackUserActivity);

        const savedTime = sessionStorage.getItem("activeTime");
        if (savedTime) {
            const parsedTime = parseFloat(savedTime);
            if (!isNaN(parsedTime) && parsedTime > 0) {
                setActiveTime(parsedTime);
            }
        }

        activityInterval.current = setInterval(() => {
            const now = Date.now();
            const idleTime = now - lastActivityTime.current;

            // Continue tracking time even after goal is completed
            if (idleTime < 60000) {
                setActiveTime((prev) => {
                    // Don't cap the time at GOAL_MINUTES to track full usage
                    const newTime = prev + 1 / 60;

                    sessionStorage.setItem("activeTime", newTime.toString());

                    if (
                        session &&
                        streakInfo?.activeSession &&
                        (Math.floor(newTime * 4) > Math.floor(prev * 4) ||
                            Date.now() % 15000 < 1000)
                    ) {
                        fetch("/api/streak/update-time", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                sessionId: streakInfo.activeSession.id,
                                activeTime: newTime,
                            }),
                        }).catch((error) => {
                            console.error(
                                "Failed to update activity time:",
                                error
                            );
                        });
                    }

                    if (prev < GOAL_MINUTES && newTime >= GOAL_MINUTES) {
                        setGoalCompleted(true);

                        const today = new Date().toDateString();
                        const lastNotificationDay = localStorage.getItem(
                            "lastStreakNotificationDay"
                        );

                        if (
                            lastNotificationDay !== today &&
                            !notificationShown
                        ) {
                            toast.success(
                                "Congratulations! You've completed your 30-minute daily goal!",
                                {
                                    duration: 5000,
                                }
                            );
                            localStorage.setItem(
                                "lastStreakNotificationDay",
                                today
                            );
                            setNotificationShown(true);
                        }
                    }

                    return newTime;
                });
            }
        }, 1000);

        return () => {
            window.removeEventListener("mousemove", trackUserActivity);
            window.removeEventListener("keydown", trackUserActivity);
            window.removeEventListener("click", trackUserActivity);
            window.removeEventListener("scroll", trackUserActivity);
            window.removeEventListener("touchstart", trackUserActivity);

            if (activityInterval.current) {
                clearInterval(activityInterval.current);
                activityInterval.current = null;
            }
        };
    }, [streakInfo?.activeSession, goalCompleted, endSession]);

    useEffect(() => {
        const checkDayChange = () => {
            const now = new Date();
            const currentDay = now.toDateString();
            const lastActiveDay = streakInfo?.activeSession
                ? new Date(streakInfo.activeSession.startTime).toDateString()
                : null;

            if (lastActiveDay && lastActiveDay !== currentDay) {
                setActiveTime(0);
                setGoalCompleted(false);
                setNotificationShown(false);

                if (session && streakInfo?.activeSession) {
                    fetch("/api/streak/update-time", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            sessionId: streakInfo.activeSession.id,
                            activeTime: 0,
                        }),
                    }).catch((error) => {
                        console.error(
                            "Failed to reset activity time on server:",
                            error
                        );
                    });
                }
            }
        };

        checkDayChange();

        const dayChangeInterval = setInterval(checkDayChange, 60000);

        return () => clearInterval(dayChangeInterval);
    }, [session, streakInfo]);

    useEffect(() => {
        if (!session) return;

        const updateServerTime = () => {
            if (streakInfo?.activeSession) {
                const savedTime = sessionStorage.getItem("activeTime");
                const timeToUpdate = savedTime
                    ? Math.max(parseFloat(savedTime), activeTime)
                    : activeTime;

                fetch("/api/streak/update-time", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sessionId: streakInfo.activeSession.id,
                        activeTime: timeToUpdate,
                    }),
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(
                                `Server responded with ${response.status}`
                            );
                        }
                        return response.json();
                    })
                    .then((data) => {
                        if (data.activeTime && data.activeTime > activeTime) {
                            setActiveTime(data.activeTime);
                            sessionStorage.setItem(
                                "activeTime",
                                data.activeTime.toString()
                            );
                        }
                    })
                    .catch((error) => {
                        console.error("Failed to update activity time:", error);
                    });
            }
        };

        updateServerTime();

        const serverUpdateTimer = setInterval(updateServerTime, 15000);

        window.addEventListener("beforeunload", updateServerTime);

        return () => {
            clearInterval(serverUpdateTimer);
            window.removeEventListener("beforeunload", updateServerTime);
            updateServerTime();
        };
    }, [streakInfo?.activeSession, activeTime, session]);

    useEffect(() => {
        if (!streakInfo?.activeSession || timeLeft === 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endSession();
                    return 0;
                }
                return prev - 1;
            });
        }, 60000);

        return () => clearInterval(timer);
    }, [streakInfo?.activeSession, timeLeft, endSession]);

    return (
        <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <div
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-background/80 backdrop-blur-md border border-border hover:bg-accent/50 transition-colors cursor-pointer shadow-sm"
                        tabIndex={0}
                        aria-label="Your streak information"
                        role="button"
                        onKeyDown={(e) =>
                            e.key === "Enter" && setIsDialogOpen(true)
                        }
                    >
                        <span className="text-sm font-medium text-foreground">
                            {streakInfo?.currentStreak || 1}
                        </span>
                        <span className="text-amber-500">🔥</span>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Your LofiVibes Activity
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="overview" className="mt-2">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="statistics">
                                Statistics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="overview"
                            className="space-y-4 py-4"
                        >
                            {/* Streak Information */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/5">
                                    <span className="text-sm text-muted-foreground">
                                        Current Streak
                                    </span>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-3xl font-bold">
                                            {streakInfo?.currentStreak || 1}
                                        </span>
                                        <span className="text-amber-500 text-xl">
                                            🔥
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        days
                                    </span>
                                </div>

                                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/5">
                                    <span className="text-sm text-muted-foreground">
                                        Highest Streak
                                    </span>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-3xl font-bold">
                                            {streakInfo?.highestStreak ||
                                                streakInfo?.currentStreak ||
                                                1}
                                        </span>
                                        <span className="text-amber-500 text-xl">
                                            🏆
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        days
                                    </span>
                                </div>
                            </div>

                            {/* Progress Information */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        Daily Goal Progress
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {activeTime.toFixed(1)}/{GOAL_MINUTES}{" "}
                                        minutes
                                    </span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{
                                            width: `${
                                                (activeTime / GOAL_MINUTES) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Use LofiVibes for 30 minutes each day to
                                    maintain your streak.
                                </p>
                            </div>

                            <Separator />

                            {/* Account Information */}
                            {session ? (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium">
                                        Account Information
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        {session.user?.image ? (
                                            <Image
                                                src={session.user.image || ""}
                                                alt={
                                                    session.user.name ||
                                                    "User profile"
                                                }
                                                width={40}
                                                height={40}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-sm font-medium">
                                                    {session.user?.name?.charAt(
                                                        0
                                                    ) || "U"}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {session.user?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-2">
                                        <Button
                                            onClick={() => signOut()}
                                            className="w-full"
                                            variant="outline"
                                            size="sm"
                                        >
                                            Sign Out
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium">
                                        Account
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Sign in with your Google account to
                                        track your streak progress and unlock
                                        achievements.
                                    </p>
                                    <Button
                                        onClick={() => signIn("google")}
                                        className="w-full"
                                        size="sm"
                                    >
                                        Sign in with Google
                                    </Button>
                                </div>
                            )}

                            {/* Streak Information */}
                            <div className="rounded-lg bg-amber-500/10 p-3 mt-2">
                                <div className="flex items-start gap-2">
                                    <span className="text-amber-500 text-lg">
                                        💡
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-medium">
                                            How streaks work
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Use LofiVibes for at least 30
                                            minutes each day to maintain your
                                            streak. If you miss a day, your
                                            streak will reset to 1.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="statistics" className="py-4">
                            <UserStats />
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
};

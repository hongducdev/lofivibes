"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

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
};

export const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  const endSession = async () => {
    if (!streakInfo?.activeSession) return;

    await fetch("/api/streak", {
      method: "PATCH",
      body: JSON.stringify({ sessionId: streakInfo.activeSession.id }),
    });
    await fetchStreakInfo();
  };

  useEffect(() => {
    if (session) {
      fetchStreakInfo();
    } else {
      setStreakInfo({ currentStreak: 1, activeSession: null });
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-xl font-bold tracking-tight hover:text-primary transition-colors"
            tabIndex={0}
            aria-label="LofiVibes Home"
          >
            LofiVibes
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/playlists" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              tabIndex={0}
              aria-label="Browse playlists"
            >
              Playlists
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              tabIndex={0}
              aria-label="About LofiVibes"
            >
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div 
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
                tabIndex={0}
                aria-label="Your streak information"
              >
                <span className="text-sm font-medium">
                  {streakInfo?.currentStreak || 1}
                </span>
                <span className="text-amber-500">🔥</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0" align="end">
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-lg">Daily Streak</h3>
                <p className="text-sm text-muted-foreground">
                  Maintain your streak by using LofiVibes for 30 minutes each day.
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current streak:</span>
                  <span className="font-semibold">{streakInfo?.currentStreak || 1} days</span>
                </div>
                
                {streakInfo?.highestStreak && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Highest streak:</span>
                    <span className="font-semibold">{streakInfo.highestStreak} days</span>
                  </div>
                )}
                
                {streakInfo?.activeSession ? (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Time remaining:</span>
                      <span className="font-semibold">{timeLeft} minutes</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(timeLeft / 30) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={startSession} 
                    className="w-full mt-2"
                    size="sm"
                  >
                    Start 30-minute Session
                  </Button>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>

          {session ? (
            <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full"
                  aria-label="Open user menu"
                >
                  {session.user?.image ? (
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || "User profile"} 
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {session.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="end">
                <div className="p-2 text-sm">
                  <div className="px-2 py-1.5 font-medium">{session.user?.name}</div>
                  <div className="px-2 py-1 text-xs text-muted-foreground">{session.user?.email}</div>
                </div>
                <Separator />
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm px-2 h-9"
                    onClick={() => router.push("/profile")}
                  >
                    Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm px-2 h-9"
                    onClick={() => router.push("/settings")}
                  >
                    Settings
                  </Button>
                </div>
                <Separator />
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm px-2 h-9 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => {
                      signOut();
                      setIsProfileOpen(false);
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => signIn("google")}
              className="h-9"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

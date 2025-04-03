"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { signIn, signOut } from "next-auth/react";
import { toast } from "sonner";

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

const GOAL_MINUTES = 30;

export const StreakDisplay = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [activeTime, setActiveTime] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalCompleted, setGoalCompleted] = useState(false);
  const lastActivityTime = useRef<number>(Date.now());
  const activityInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchStreakInfo = async () => {
    try {
      const response = await fetch("/api/streak");
      
      if (!response.ok) {
        // Handle error responses (like 401 Unauthorized)
        console.warn(`Error fetching streak info: ${response.status} ${response.statusText}`);
        setStreakInfo({ currentStreak: 1, activeSession: null });
        return;
      }
      
      const data = await response.json();
      setStreakInfo(data);

      if (data.activeSession) {
        const startTime = new Date(data.activeSession.startTime).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000 / 60);
        const minutesUsed = Math.min(GOAL_MINUTES, elapsed);
        setActiveTime(minutesUsed);
        setTimeLeft(Math.max(0, GOAL_MINUTES - elapsed));
        
        // Check if goal is completed but not yet acknowledged
        if (elapsed >= GOAL_MINUTES && !goalCompleted) {
          setGoalCompleted(true);
          toast.success("Congratulations! You've completed your 30-minute daily goal!", {
            duration: 5000,
          });
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
  };

  const startSession = async () => {
    if (!session) {
      signIn("google");
      return;
    }

    try {
      const response = await fetch("/api/streak", {
        method: "POST",
      });
      
      if (!response.ok) {
        console.warn(`Error starting streak session: ${response.status} ${response.statusText}`);
        return;
      }
      
      await fetchStreakInfo();
    } catch (error) {
      console.error("Failed to start streak session:", error);
    }
  };

  const endSession = async () => {
    if (!streakInfo?.activeSession) return;

    try {
      const response = await fetch("/api/streak", {
        method: "PATCH",
        body: JSON.stringify({ sessionId: streakInfo.activeSession.id }),
      });
      
      if (!response.ok) {
        console.warn(`Error ending streak session: ${response.status} ${response.statusText}`);
        return;
      }
      
      await fetchStreakInfo();
    } catch (error) {
      console.error("Failed to end streak session:", error);
    }
  };

  useEffect(() => {
    // Always set a default value first
    setStreakInfo({ currentStreak: 1, activeSession: null });
    
    // Then try to fetch actual data if session exists
    if (session) {
      fetchStreakInfo();
    }
  }, [session]);

  // Track user activity
  const trackUserActivity = () => {
    lastActivityTime.current = Date.now();
  };

  // Setup activity detection
  useEffect(() => {
    // Debug info
    console.log("Activity tracking - streakInfo:", streakInfo);
    console.log("Activity tracking - activeTime:", activeTime);
    
    // Only track if there's an active session
    if (!streakInfo?.activeSession) {
      // Even without an active session, we'll simulate activity for testing
      const testInterval = setInterval(() => {
        setActiveTime(prev => Math.min(GOAL_MINUTES, prev + (1/60)));
      }, 1000);
      
      return () => clearInterval(testInterval);
    }

    // Add event listeners to track user activity
    window.addEventListener('mousemove', trackUserActivity);
    window.addEventListener('keydown', trackUserActivity);
    window.addEventListener('click', trackUserActivity);
    window.addEventListener('scroll', trackUserActivity);
    window.addEventListener('touchstart', trackUserActivity);

    // Start the activity tracking interval
    activityInterval.current = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityTime.current;
      
      // If user has been active in the last 60 seconds, increment active time
      if (idleTime < 60000 && !goalCompleted) {
        setActiveTime(prev => {
          const newTime = Math.min(GOAL_MINUTES, prev + (1/60)); // Increment by 1 second (1/60 of a minute)
          
          // Check if we just reached the goal
          if (prev < GOAL_MINUTES && newTime >= GOAL_MINUTES) {
            setGoalCompleted(true);
            toast.success("Congratulations! You've completed your 30-minute daily goal!", {
              duration: 5000,
            });
          }
          
          return newTime;
        });
      }
    }, 1000); // Check every second for more accurate tracking

    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', trackUserActivity);
      window.removeEventListener('keydown', trackUserActivity);
      window.removeEventListener('click', trackUserActivity);
      window.removeEventListener('scroll', trackUserActivity);
      window.removeEventListener('touchstart', trackUserActivity);
      
      // Clear the interval
      if (activityInterval.current) {
        clearInterval(activityInterval.current);
        activityInterval.current = null;
      }
    };
  }, [streakInfo?.activeSession, goalCompleted]);

  // Update server with activity time periodically
  useEffect(() => {
    console.log("Server update - activeTime:", activeTime);
    console.log("Server update - streakInfo:", streakInfo);
    
    if (!streakInfo?.activeSession || timeLeft === 0) return;

    const timer = setInterval(() => {
      // Update the server with current activity time every minute
      if (session && streakInfo?.activeSession) {
        fetch("/api/streak/update-time", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            sessionId: streakInfo.activeSession.id,
            activeTime: activeTime 
          }),
        }).catch(error => {
          console.error("Failed to update active time:", error);
        });
      }
      
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
  }, [streakInfo?.activeSession, timeLeft, activeTime, session]);

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
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
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Your Streak Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Streak Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/5">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-3xl font-bold">{streakInfo?.currentStreak || 1}</span>
                  <span className="text-amber-500 text-xl">🔥</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">days</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/5">
                <span className="text-sm text-muted-foreground">Highest Streak</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-3xl font-bold">{streakInfo?.highestStreak || streakInfo?.currentStreak || 1}</span>
                  <span className="text-amber-500 text-xl">🏆</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">days</span>
              </div>
            </div>
            
            {/* Progress Information */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Daily Goal Progress</span>
                <span className="text-sm text-muted-foreground">
                  {activeTime.toFixed(1)}/{GOAL_MINUTES} minutes
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(activeTime / GOAL_MINUTES) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use LofiVibes for 30 minutes each day to maintain your streak.
              </p>
            </div>
            
            <Separator />
            
            {/* Account Information */}
            {session ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Account Information</h3>
                <div className="flex items-center gap-3">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User profile"} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {session.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex justify-between gap-2 pt-2">
                  <Button 
                    onClick={() => signOut()} 
                    className="flex-1"
                    variant="outline"
                    size="sm"
                  >
                    Sign Out
                  </Button>
                  
                  {streakInfo?.activeSession ? (
                    <Button 
                      className="flex-1"
                      size="sm"
                      variant="secondary"
                      disabled
                    >
                      {goalCompleted 
                        ? "Goal Completed! 🎉" 
                        : `Session Active (${timeLeft}m left)`}
                    </Button>
                  ) : (
                    <Button 
                      onClick={startSession} 
                      className="flex-1"
                      size="sm"
                    >
                      Start Session
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign in with your Google account to track your streak progress and unlock achievements.
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
                <span className="text-amber-500 text-lg">💡</span>
                <div>
                  <h4 className="text-sm font-medium">How streaks work</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use LofiVibes for at least 30 minutes each day to maintain your streak. 
                    If you miss a day, your streak will reset to 1.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

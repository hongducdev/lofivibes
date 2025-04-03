"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type StatData = {
  currentStreak: number;
  highestStreak: number;
  totalMinutes: number;
  averageMinutesPerDay: number;
  totalDays: number;
  completedDays: number;
  completionRate: number;
  weeklyActivity: ActivityData[];
  monthlyActivity: ActivityData[];
};

type ActivityData = {
  date: string;
  day: string;
  minutes: number;
  goal: number;
};

export const UserStats = () => {
  const { data: session } = useSession();
  const [statsData, setStatsData] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/streak/stats");
        if (response.ok) {
          const data = await response.json();
          setStatsData(data);
        } else {
          console.error("Failed to fetch stats:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session]);

  const chartConfig = {
    minutes: {
      label: "Minutes",
      theme: {
        light: "hsl(var(--primary))",
        dark: "hsl(var(--primary))",
      },
    },
    goal: {
      label: "Goal Completion",
      theme: {
        light: "hsl(var(--amber-500))",
        dark: "hsl(var(--amber-500))",
      },
    },
  };

  if (loading) {
    return <StatsLoading />;
  }

  if (!statsData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No statistics available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          title="Current Streak"
          value={statsData.currentStreak}
          description="consecutive days"
          icon="🔥"
        />
        <StatCard
          title="Highest Streak"
          value={statsData.highestStreak}
          description="consecutive days"
          icon="🏆"
        />
        <StatCard
          title="Total Time"
          value={Math.round(statsData.totalMinutes)}
          description="minutes listening"
          icon="⏱️"
        />
        <StatCard
          title="Completion Rate"
          value={Math.round(statsData.completionRate)}
          description="% of days completed"
          icon="✅"
        />
      </div>

      <Tabs defaultValue="weekly" className="w-full space-y-2">
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Weekly Activity</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Listening Activity</CardTitle>
              <CardDescription className="text-xs">
                Minutes spent listening over the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {statsData.weeklyActivity.slice(0, 7).reverse().map((day) => (
                  <div key={day.date} className="flex items-center gap-2">
                    <div className="w-10 text-xs text-muted-foreground">{day.day}</div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${Math.min(100, (day.minutes / 30) * 100)}%` }}
                      />
                      {day.minutes > 30 && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-white font-medium px-1 rounded">
                          +{Math.floor(day.minutes - 30)}m
                        </div>
                      )}
                    </div>
                    <div className="w-10 text-xs text-right">{day.minutes}m</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Goal Completion</CardTitle>
              <CardDescription className="text-xs">
                Percentage of daily 30-minute goal completed
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {statsData.weeklyActivity.slice(0, 7).reverse().map((day) => (
                  <div key={day.date} className="flex items-center gap-2">
                    <div className="w-10 text-xs text-muted-foreground">{day.day}</div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${day.goal}%` }}
                      />
                      {day.minutes > 30 && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-white font-medium px-1 rounded">
                          {Math.floor(day.minutes)}m
                        </div>
                      )}
                    </div>
                    <div className="w-10 text-xs text-right">
                      {day.minutes > 30 ? `${Math.floor(day.minutes)}m` : `${Math.round(day.goal)}%`}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div>0 min</div>
                <div>Goal: 30 minutes</div>
                <div>30+ min</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Listening Activity</CardTitle>
              <CardDescription className="text-xs">
                Minutes spent listening over the past 14 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-7 gap-1">
                {statsData.monthlyActivity.slice(0, 14).reverse().map((day) => {
                  const date = new Date(day.date);
                  const dayNum = date.getDate();
                  const fillPercentage = Math.min(100, (day.minutes / 30) * 100);
                  const bgColor = fillPercentage >= 100 
                    ? 'bg-primary' 
                    : fillPercentage >= 50 
                      ? 'bg-primary/70' 
                      : fillPercentage > 0 
                        ? 'bg-primary/40' 
                        : 'bg-muted';
                  
                  return (
                    <div 
                      key={day.date} 
                      className="flex flex-col items-center"
                      title={`${date.toLocaleDateString()}: ${day.minutes} minutes`}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs ${bgColor} ${fillPercentage > 0 ? 'text-white' : 'text-muted-foreground'}`}>
                        {dayNum}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/40 rounded"></div>
                  <span>1-14 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/70 rounded"></div>
                  <span>15-29 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded"></div>
                  <span>30+ min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Statistics</CardTitle>
              <CardDescription className="text-xs">
                Summary of your listening habits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Average Daily Time
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">
                      {statsData.averageMinutesPerDay.toFixed(1)}
                    </div>
                    <div className="ml-1 text-sm text-muted-foreground">
                      minutes
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Active Days
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">
                      {statsData.totalDays}
                    </div>
                    <div className="ml-1 text-sm text-muted-foreground">
                      / 30 days
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Goals Completed
                  </div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">
                      {statsData.completedDays}
                    </div>
                    <div className="ml-1 text-sm text-muted-foreground">
                      days
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// StatCard component moved to src/components/ui/stat-card.tsx

const StatsLoading = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-1" />
                <Skeleton className="h-3 w-[80px]" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[150px] mb-1" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
};

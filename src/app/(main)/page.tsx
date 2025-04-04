"use client";

import { useState, useEffect } from "react";
import AboutMe from "@/components/about-me";
import Pomodoro from "@/components/pomodoro";
import Settings from "@/components/settings";
import Time from "@/components/time";
import TodoList from "@/components/todolist";
import ThemeToggle from "@/components/theme-toggle";
import { StreakDisplay } from "@/components/streak-display";
import { VideoBackground } from "@/components/video-background";
import { MusicPlayer } from "@/components/music-player";
import SoundControls from "@/components/sound-controls";
import ShowNoti from "@/components/show-noti";
import ActiveUsers from "@/components/active-users";
import ChangeBackground from "@/components/change-background";
import NetworkStatus from "@/components/network-status";
import OrientationOverlay from "@/components/orientation-overlay";
import { Toaster } from "sonner";
import {
    type BackgroundVideo,
    backgroundConfig,
} from "@/config/background-config";

export default function Home() {
    const [showGuide, setShowGuide] = useState(true);
    const [currentBackground, setCurrentBackground] = useState<BackgroundVideo>(
        backgroundConfig[0]
    );
    const [clockPosition, setClockPosition] = useState<"corner" | "center">("corner");

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        try {
            const saved = localStorage.getItem("selectedBackground");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setCurrentBackground(parsed);
                } catch (error) {
                    console.error("Error parsing saved background:", error);
                }
            }
            
            const savedPosition = localStorage.getItem("clockPosition");
            if (savedPosition === "center" || savedPosition === "corner") {
                setClockPosition(savedPosition);
            }
            
            const handleSettingsChange = () => {
                const updatedPosition = localStorage.getItem("clockPosition");
                if (updatedPosition === "center" || updatedPosition === "corner") {
                    setClockPosition(updatedPosition);
                }
            };
            
            window.addEventListener("clockSettingsChanged", handleSettingsChange);
            
            return () => {
                window.removeEventListener("clockSettingsChanged", handleSettingsChange);
            };
        } catch (error) {
            console.error("Error in client-side initialization:", error);
        }
    }, []);

    const handleBackgroundChange = (background: BackgroundVideo) => {
        setCurrentBackground(background);
        try {
            localStorage.setItem("selectedBackground", JSON.stringify(background));
        } catch (error) {
            console.error("Error saving background to localStorage:", error);
        }
    };



    return (
        <main className="relative h-screen w-screen overflow-hidden">
            <Toaster />
            <NetworkStatus />
            <OrientationOverlay />
            <VideoBackground currentBackground={currentBackground} />
            <div className="relative z-20 flex flex-col min-h-screen p-2 lg:p-6">
                {clockPosition === "center" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                        <Time position={clockPosition} />
                    </div>
                )}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-4">
                        {clockPosition === "corner" && (
                            <Time position={clockPosition} />
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2 lg:gap-4">
                        <div className="flex items-center gap-4 flex-wrap justify-end">
                            <StreakDisplay />
                            <AboutMe />
                            <ThemeToggle />
                            <TodoList />
                            <Pomodoro />
                            <Settings />
                        </div>
                    </div>
                </div>
                <div>
                    <SoundControls />
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-2 lg:p-6">
                    <div className="flex justify-between items-end flex-wrap gap-2 lg:gap-4">
                        <MusicPlayer />
                    </div>
                </div>
                <div className="fixed bottom-2 right-2 lg:right-6 lg:bottom-6 flex flex-col-reverse lg:flex-row gap-2 lg:gap-4 flex-wrap">
                    <ChangeBackground
                        currentBackground={currentBackground}
                        onBackgroundChange={handleBackgroundChange}
                    />
                    <ActiveUsers />
                </div>
                <ShowNoti show={showGuide} setShow={setShowGuide} />
            </div>
        </main>
    );
}

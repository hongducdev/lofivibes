"use client";

import { useState, useEffect } from "react";
import AboutMe from "@/components/about-me";
import Pomodoro from "@/components/pomodoro";
import Settings from "@/components/settings";
import Time from "@/components/time";
import TodoList from "@/components/todolist";
import ThemeToggle from "@/components/theme-toggle";
import { VideoBackground } from "@/components/video-background";
import { MusicPlayer } from "@/components/music-player";
import SoundControls from "@/components/sound-controls";
import ShowNoti from "@/components/show-noti";
import ActiveUsers from "@/components/active-users";
import ChangeBackground from "@/components/change-background";
import {
    type BackgroundVideo,
    backgroundConfig,
} from "@/config/background-config";

export default function Home() {
    const [showGuide, setShowGuide] = useState(true);
    const [currentBackground, setCurrentBackground] = useState<BackgroundVideo>(
        backgroundConfig[0]
    );

    useEffect(() => {
        const saved = localStorage.getItem("selectedBackground");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCurrentBackground(parsed);
            } catch (e) {
                console.error("Failed to parse saved background:", e);
            }
        }
    }, []);

    const handleBackgroundChange = (background: BackgroundVideo) => {
        setCurrentBackground(background);
        localStorage.setItem("selectedBackground", JSON.stringify(background));
    };

    return (
        <div className="relative min-h-screen">
            <VideoBackground currentBackground={currentBackground} />
            <div className="relative z-20 flex flex-col min-h-screen p-8">
                <div className="flex justify-between items-start">
                    <div className="flex flex-row-reverse gap-4">
                        <AboutMe />
                        <TodoList />
                        <Pomodoro />
                        <ThemeToggle />
                        <Settings />
                    </div>
                    <div className="flex items-center gap-4">
                        <Time />
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <MusicPlayer />
                </div>
                <div className="flex justify-center">
                    <SoundControls />
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2">
                    <div className="relative z-50">
                        <ChangeBackground
                            currentBackground={currentBackground}
                            onBackgroundChange={handleBackgroundChange}
                        />
                    </div>
                    <ActiveUsers />
                </div>
                <ShowNoti show={showGuide} setShow={setShowGuide} />
            </div>
        </div>
    );
}

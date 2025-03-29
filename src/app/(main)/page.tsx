"use client";

import { useState } from "react";
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

export default function Home() {
    const [showGuide, setShowGuide] = useState(true);

    return (
        <div className="relative min-h-screen">
            <VideoBackground />
            <div className="relative z-20 flex flex-col min-h-screen p-8">
                <div className="flex items-center justify-between">
                    <Time />
                    <div className="flex items-center gap-4">
                        <AboutMe />
                        <TodoList />
                        <Pomodoro />
                        <ThemeToggle />
                        <Settings />
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <MusicPlayer />
                </div>
                <div className="flex justify-center">
                    <SoundControls />
                </div>
                <ShowNoti show={showGuide} setShow={setShowGuide} />
                <div className="absolute bottom-6 right-6">
                    <ActiveUsers />
                </div>
            </div>
        </div>
    );
}

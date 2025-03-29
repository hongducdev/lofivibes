import AboutMe from "@/components/about-me";
import Pomodoro from "@/components/pomodoro";
import Settings from "@/components/settings";
import Time from "@/components/time";
import TodoList from "@/components/todolist";
import ThemeToggle from "@/components/theme-toggle";
import { VideoBackground } from "@/components/video-background";
import { MusicPlayer } from "@/components/music-player";
import SoundControls from "@/components/sound-controls";

/**
 * The Home component is the main page layout for the application.
 * It displays a time component, main content including an image,
 * an ordered list with instructions, and action links. The footer
 * contains additional informational links. The component also includes
 * settings, a to-do list, and a pomodoro timer as absolute positioned
 * elements on the page.
 */
export default function Home() {
    return (
        <div className="relative min-h-screen">
            {/* Main content */}
            <div className="relative z-20 flex flex-col min-h-screen p-8">
                {/* Header */}
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
            </div>

            {/* Background video */}
            <div className="fixed inset-0 -z-10">
                <VideoBackground />
            </div>

            {/* Music player and sound controls */}
            <MusicPlayer />
            <div className="fixed top-1/2 right-6 -translate-y-1/2 z-50">
                <SoundControls />
            </div>
        </div>
    );
}

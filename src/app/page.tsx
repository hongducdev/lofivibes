import AboutMe from "@/components/about-me";
import Pomodoro from "@/components/pomodoro";
import Settings from "@/components/settings";
import Time from "@/components/time";
import TodoList from "@/components/todolist";
import { MusicPlayer } from "@/components/music-player";
import ThemeToggle from "@/components/theme-toggle";

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
                <header className="flex items-center justify-between">
                    <Time />
                    <div className="flex items-center gap-4">
                        <AboutMe />
                        <TodoList />
                        <Pomodoro />
                        <ThemeToggle />
                        <Settings />
                    </div>
                </header>

                {/* Center content */}
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">
                            LofiVibes
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-lg">
                            Immerse yourself in soothing lofi beats. Perfect for
                            studying, working, or just unwinding.
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-4 text-center text-sm text-muted-foreground">
                    Made with ♥️ by{" "}
                    <a
                        href="https://hongduc.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                        Hong Duc Dev
                    </a>
                </footer>
            </div>

            {/* Background music player */}
            <MusicPlayer />
        </div>
    );
}

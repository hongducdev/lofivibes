"use client";

import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Theme = "light" | "dark" | "system";

const themes = [
    {
        name: "Light",
        value: "light" as Theme,
        icon: Sun,
    },
    {
        name: "Dark",
        value: "dark" as Theme,
        icon: Moon,
    },
    {
        name: "System",
        value: "system" as Theme,
        icon: Laptop,
    },
] as const;

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const getIcon = () => {
        switch (theme) {
            case "light":
                return Sun;
            case "dark":
                return Moon;
            default:
                return Laptop;
        }
    };

    const Icon = getIcon();

    return (
        <Popover>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger
                            className="cursor-pointer w-10 h-10 rounded flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-md hover:bg-background/90 transition-colors"
                            aria-label="Toggle theme"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Icon className="text-zinc-900 dark:text-zinc-100 w-5 h-5" />
                            </motion.div>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Change Theme</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-48 p-2 bg-background/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col gap-1">
                    {themes.map(({ name, value, icon: ThemeIcon }) => (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                                theme === value
                                    ? "bg-primary/10 text-primary"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                            }`}
                            aria-label={`Switch to ${name.toLowerCase()} theme`}
                        >
                            <ThemeIcon className="w-4 h-4" />
                            <span>{name}</span>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ThemeToggle;

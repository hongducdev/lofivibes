"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { KeyboardEvent } from "react";

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const handleThemeToggle = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleThemeToggle();
        }
    };

    return (
        <motion.button
            onClick={handleThemeToggle}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="w-14 h-14 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
            } theme`}
            role="switch"
            aria-checked={theme === "dark"}
        >
            <motion.div
                initial={false}
                animate={{
                    scale: theme === "dark" ? 1 : 0,
                    rotate: theme === "dark" ? 0 : 180,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute"
            >
                <Moon className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    scale: theme === "light" ? 1 : 0,
                    rotate: theme === "light" ? 0 : -180,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute"
            >
                <Sun className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;

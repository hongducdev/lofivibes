"use client";
import React, { useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
    RiTimerLine,
    RiRestartLine,
    RiPauseLine,
    RiPlayLine,
} from "react-icons/ri";
import NumberFlow, { type Value } from "@number-flow/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type TimerState = "work" | "break" | "longBreak";

const TIMER_CONFIG = {
    work: 25 * 60,
    break: 5 * 60,
    longBreak: 15 * 60,
};

const Pomodoro = () => {
    const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.work);
    const [isRunning, setIsRunning] = useState(false);
    const [timerState, setTimerState] = useState<TimerState>("work");
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [config, setConfig] = useState(TIMER_CONFIG);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    useEffect(() => {
        const loadSettings = () => {
            const savedSettings = localStorage.getItem("pomodoroSettings");
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                const newConfig = {
                    work: settings.work * 60,
                    break: settings.break * 60,
                    longBreak: settings.longBreak * 60,
                };
                setConfig(newConfig);
                if (!isRunning) {
                    setTimeLeft(newConfig[timerState]);
                }
            }
        };

        loadSettings();
        window.addEventListener("pomodoroSettingsChanged", loadSettings);
        return () =>
            window.removeEventListener("pomodoroSettingsChanged", loadSettings);
    }, [isRunning, timerState]);

    const handleTimerComplete = () => {
        if (timerState === "work") {
            setCompletedPomodoros((prev) => prev + 1);
            if (completedPomodoros === 3) {
                setTimerState("longBreak");
                setTimeLeft(config.longBreak);
                setCompletedPomodoros(0);
            } else {
                setTimerState("break");
                setTimeLeft(config.break);
            }
        } else {
            setTimerState("work");
            setTimeLeft(config.work);
        }
        setIsRunning(false);
    };

    const handleReset = () => {
        setTimeLeft(config[timerState]);
        setIsRunning(false);
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const formatTimeWithAnimation = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const minsStr = mins.toString().padStart(2, "0");
        const secsStr = secs.toString().padStart(2, "0");

        return (
            <div className="flex items-center space-x-1">
                {minsStr.split("").map((digit, i) => (
                    <NumberFlow
                        key={`min-${i}`}
                        value={parseInt(digit) as Value}
                        trend={0}
                        format={{ notation: "compact" }}
                        className="text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                ))}
                <span className="text-zinc-400 dark:text-zinc-500 font-mono">
                    :
                </span>
                {secsStr.split("").map((digit, i) => (
                    <NumberFlow
                        key={`sec-${i}`}
                        value={parseInt(digit) as Value}
                        trend={0}
                        format={{ notation: "compact" }}
                        className="text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                ))}
            </div>
        );
    };

    return (
        <Popover>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger
                            className="cursor-pointer w-14 h-14 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-md hover:bg-background/90 transition-colors"
                            aria-label="Pomodoro timer"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <RiTimerLine className="text-zinc-900 dark:text-zinc-100 w-6 h-6" />
                            </motion.div>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Pomodoro Timer</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-80 p-4 bg-background/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between w-full">
                        <h5 className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">
                            {timerState === "work"
                                ? "Focus Time"
                                : timerState === "break"
                                ? "Short Break"
                                : "Long Break"}
                        </h5>
                        <span className="text-xs text-zinc-500">
                            {completedPomodoros}/4 Pomodoros
                        </span>
                    </div>

                    <motion.div className="relative w-48 h-48" initial={false}>
                        <svg
                            className="w-full h-full transform -rotate-90"
                            viewBox="0 0 100 100"
                        >
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-zinc-200 dark:text-zinc-700"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeDasharray={283}
                                strokeDashoffset={
                                    283 - (timeLeft / config[timerState]) * 283
                                }
                                className={`${
                                    timerState === "work"
                                        ? "text-red-500"
                                        : "text-green-500"
                                }`}
                                transition={{ duration: 0.5, ease: "linear" }}
                            />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <motion.div
                                className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight"
                                initial={false}
                            >
                                {formatTimeWithAnimation(timeLeft)}
                            </motion.div>
                        </div>
                    </motion.div>

                    <div className="flex items-center justify-center space-x-2">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={toggleTimer}
                                aria-label={
                                    isRunning ? "Pause timer" : "Start timer"
                                }
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={isRunning ? "pause" : "play"}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {isRunning ? (
                                            <RiPauseLine className="w-5 h-5" />
                                        ) : (
                                            <RiPlayLine className="w-5 h-5" />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleReset}
                                aria-label="Reset timer"
                            >
                                <RiRestartLine className="w-5 h-5" />
                            </Button>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-2">
                        {["work", "break", "longBreak"].map((state) => (
                            <motion.button
                                key={state}
                                onClick={() => {
                                    setTimerState(state as TimerState);
                                    setTimeLeft(config[state as TimerState]);
                                    setIsRunning(false);
                                }}
                                className={`px-3 py-1 rounded-full text-xs ${
                                    timerState === state
                                        ? "bg-zinc-200 dark:bg-zinc-700"
                                        : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {state === "work"
                                    ? "Focus"
                                    : state === "break"
                                    ? "Break"
                                    : "Long Break"}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default Pomodoro;

"use client";

import { useEffect, useState } from "react";
import NumberFlow, { type Value } from "@number-flow/react";
import { cn } from "@/lib/utils";

export type ClockStyle = "digital" | "analog" | "minimal" | "text";
export type ClockPosition = "corner" | "center";
export type ClockColor = "white" | "gray" | "blue" | "green" | "red" | "purple" | "yellow";
export type ClockSize = "small" | "medium" | "large";

interface TimeProps {
    position?: ClockPosition;
}

const Time = ({ position = "corner" }: TimeProps) => {
    const [time, setTime] = useState(new Date());
    const [clockStyle, setClockStyle] = useState<ClockStyle>("digital");
    const [disableBackground, setDisableBackground] = useState(false);
    const [clockColor, setClockColor] = useState<ClockColor>("white");
    const [clockSize, setClockSize] = useState<ClockSize>("medium");
    
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        try {
            const savedStyle = localStorage.getItem("clockStyle");
            if (savedStyle && ["digital", "analog", "minimal", "text"].includes(savedStyle)) {
                setClockStyle(savedStyle as ClockStyle);
            }
            
            const savedDisableBackground = localStorage.getItem("disableClockBackground");
            setDisableBackground(savedDisableBackground === "true");
            
            const savedClockColor = localStorage.getItem("clockColor");
            if (savedClockColor && ["white", "gray", "blue", "green", "red", "purple", "yellow"].includes(savedClockColor)) {
                setClockColor(savedClockColor as ClockColor);
            }
            
            const savedClockSize = localStorage.getItem("clockSize");
            if (savedClockSize && ["small", "medium", "large"].includes(savedClockSize)) {
                setClockSize(savedClockSize as ClockSize);
            }
            
            const handleSettingsChange = (event: Event) => {
                if (event instanceof CustomEvent && event.detail) {
                    if (event.detail.style && ["digital", "analog", "minimal", "text"].includes(event.detail.style)) {
                        setClockStyle(event.detail.style as ClockStyle);
                    }
                    
                    if (typeof event.detail.disableBackground === 'boolean') {
                        setDisableBackground(event.detail.disableBackground);
                    }
                    
                    if (event.detail.color && ["white", "gray", "blue", "green", "red", "purple", "yellow"].includes(event.detail.color)) {
                        setClockColor(event.detail.color as ClockColor);
                    }
                    
                    if (event.detail.size && ["small", "medium", "large"].includes(event.detail.size)) {
                        setClockSize(event.detail.size as ClockSize);
                    }
                } else {
                    const updatedStyle = localStorage.getItem("clockStyle");
                    if (updatedStyle && ["digital", "analog", "minimal", "text"].includes(updatedStyle)) {
                        setClockStyle(updatedStyle as ClockStyle);
                    }
                    
                    const updatedDisableBackground = localStorage.getItem("disableClockBackground");
                    setDisableBackground(updatedDisableBackground === "true");
                    
                    const updatedClockColor = localStorage.getItem("clockColor");
                    if (updatedClockColor && ["white", "gray", "blue", "green", "red", "purple", "yellow"].includes(updatedClockColor)) {
                        setClockColor(updatedClockColor as ClockColor);
                    }
                    
                    const updatedClockSize = localStorage.getItem("clockSize");
                    if (updatedClockSize && ["small", "medium", "large"].includes(updatedClockSize)) {
                        setClockSize(updatedClockSize as ClockSize);
                    }
                }
            };
            
            window.addEventListener("clockSettingsChanged", handleSettingsChange);
            
            return () => {
                window.removeEventListener("clockSettingsChanged", handleSettingsChange);
            };
        } catch (error) {
            console.error("Error loading clock settings:", error);
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [clockStyle, disableBackground, clockColor, clockSize]);

    const hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const seconds = time.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;



    const getColorClass = () => {
        switch (clockColor) {
            case "white": return "text-zinc-100";
            case "gray": return "text-zinc-400";
            case "blue": return "text-blue-400";
            case "green": return "text-green-400";
            case "red": return "text-red-400";
            case "purple": return "text-purple-400";
            case "yellow": return "text-yellow-400";
            default: return "text-zinc-100";
        }
    };
    
    const getSizeClass = () => {
        switch (clockSize) {
            case "small": return {
                container: "text-xl sm:text-2xl lg:text-3xl",
                digit: "w-4 sm:w-6 lg:w-8",
                ampm: "text-sm sm:text-base lg:text-lg"
            };
            case "medium": return {
                container: "text-2xl sm:text-3xl lg:text-5xl",
                digit: "w-6 sm:w-8 lg:w-10",
                ampm: "text-lg sm:text-xl lg:text-2xl"
            };
            case "large": return {
                container: "text-3xl sm:text-4xl lg:text-6xl",
                digit: "w-8 sm:w-10 lg:w-12",
                ampm: "text-xl sm:text-2xl lg:text-3xl"
            };
            default: return {
                container: "text-2xl sm:text-3xl lg:text-5xl",
                digit: "w-6 sm:w-8 lg:w-10",
                ampm: "text-lg sm:text-xl lg:text-2xl"
            };
        }
    };
    
    const colorClass = getColorClass();
    const sizeClass = getSizeClass();
    
    const renderClockContent = () => {
        switch (clockStyle) {
            case "analog":
                return (
                    <div className={cn(
                        "relative",
                        clockSize === "small" ? "w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40" :
                        clockSize === "large" ? "w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56" :
                        "w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
                    )}>
                        <div className="absolute inset-0 rounded-full border-2 border-zinc-300 dark:border-zinc-700" />

                        {[...Array(12)].map((_, i) => {
                            const angle = i * 30;
                            const radians = (angle * Math.PI) / 180;
                            // Use percentage for positioning
                            const markerPositionX = 50 + 46 * Math.sin(radians); // 46% from center
                            const markerPositionY = 50 - 46 * Math.cos(radians); // 46% from center
                            
                            return (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "absolute w-1 h-3",
                                        clockColor === "white" ? "bg-zinc-200" :
                                        clockColor === "gray" ? "bg-zinc-400" :
                                        clockColor === "blue" ? "bg-blue-400" :
                                        clockColor === "green" ? "bg-green-400" :
                                        clockColor === "red" ? "bg-red-400" :
                                        clockColor === "purple" ? "bg-purple-400" :
                                        clockColor === "yellow" ? "bg-yellow-400" :
                                        "bg-zinc-800 dark:bg-zinc-200"
                                    )}
                                    style={{
                                        left: `${markerPositionX}%`,
                                        top: `${markerPositionY}%`,
                                        transformOrigin: 'center',
                                        transform: `translate(-50%, -50%) rotate(${angle}deg)`
                                    }}
                                />
                            );
                        })}

                        <div 
                            className={cn(
                                "absolute w-1 rounded-full",
                                clockColor === "white" ? "bg-zinc-100" :
                                clockColor === "gray" ? "bg-zinc-400" :
                                clockColor === "blue" ? "bg-blue-400" :
                                clockColor === "green" ? "bg-green-400" :
                                clockColor === "red" ? "bg-red-400" :
                                clockColor === "purple" ? "bg-purple-400" :
                                clockColor === "yellow" ? "bg-yellow-400" :
                                "bg-zinc-900 dark:bg-zinc-100"
                            )}
                            style={{
                                height: '30%',
                                position: 'absolute',
                                bottom: '50%',
                                left: '50%',
                                transformOrigin: 'center bottom',
                                transform: `translateX(-50%) rotate(${((hours % 12) * 30) + (Number(minutes) * 0.5)}deg)`
                            }}
                        />

                        <div 
                            className={cn(
                                "absolute w-0.5 rounded-full",
                                clockColor === "white" ? "bg-zinc-100" :
                                clockColor === "gray" ? "bg-zinc-400" :
                                clockColor === "blue" ? "bg-blue-400" :
                                clockColor === "green" ? "bg-green-400" :
                                clockColor === "red" ? "bg-red-400" :
                                clockColor === "purple" ? "bg-purple-400" :
                                clockColor === "yellow" ? "bg-yellow-400" :
                                "bg-zinc-800 dark:bg-zinc-200"
                            )}
                            style={{
                                height: '40%',
                                position: 'absolute',
                                bottom: '50%',
                                left: '50%',
                                transformOrigin: 'center bottom',
                                transform: `translateX(-50%) rotate(${Number(minutes) * 6}deg)`
                            }}
                        />

                        <div 
                            className={cn(
                                "absolute w-0.5 rounded-full",
                                clockColor === "white" ? "bg-zinc-100" :
                                clockColor === "gray" ? "bg-zinc-400" :
                                clockColor === "blue" ? "bg-blue-400" :
                                clockColor === "green" ? "bg-green-400" :
                                clockColor === "red" ? "bg-red-400" :
                                clockColor === "purple" ? "bg-purple-400" :
                                clockColor === "yellow" ? "bg-yellow-400" :
                                "bg-zinc-800 dark:bg-zinc-200"
                            )}
                            style={{
                                height: '45%',
                                position: 'absolute',
                                bottom: '50%',
                                left: '50%',
                                transformOrigin: 'center bottom',
                                transform: `translateX(-50%) rotate(${Number(seconds) * 6}deg)`
                            }}
                        />

                        <div className={cn(
                            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                            clockColor === "white" ? "bg-zinc-100" :
                            clockColor === "gray" ? "bg-zinc-400" :
                            clockColor === "blue" ? "bg-blue-400" :
                            clockColor === "green" ? "bg-green-400" :
                            clockColor === "red" ? "bg-red-400" :
                            clockColor === "purple" ? "bg-purple-400" :
                            clockColor === "yellow" ? "bg-yellow-400" :
                            "bg-zinc-800 dark:bg-zinc-200"
                        )} />
                    </div>
                );
            case "minimal":
                return (
                    <div className={cn(
                        "flex items-center space-x-1 lg:space-x-2 font-mono tracking-tight",
                        sizeClass.container
                    )}>
                        <span className={cn("font-bold", colorClass)}>
                            {displayHours}:{minutes}
                        </span>
                        <span className={cn("font-medium", sizeClass.ampm, colorClass)}>
                            {ampm}
                        </span>
                    </div>
                );
            case "text":
                return (
                    <div className={cn(
                        "font-serif",
                        sizeClass.container,
                        colorClass
                    )}>
                        <span>
                            {new Intl.DateTimeFormat('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                                weekday: 'long',
                            }).format(time)}
                        </span>
                    </div>
                );
            case "digital":
            default:
                return (
                    <div className={cn(
                        "flex items-center space-x-1 lg:space-x-3 font-mono tracking-tight",
                        sizeClass.container
                    )}>
                        <div className="flex">
                            {displayHours
                                .toString()
                                .split("")
                                .map((digit, i) => (
                                    <NumberFlow
                                        key={`hour-${i}`}
                                        value={parseInt(digit) as Value}
                                        trend={0}
                                        format={{ notation: "compact" }}
                                        className={cn(
                                            "text-center font-bold",
                                            sizeClass.digit,
                                            colorClass
                                        )}
                                    />
                                ))}
                        </div>
                        <span className="text-primary/60 dark:text-primary/40 animate-pulse">
                            :
                        </span>
                        <div className="flex">
                            {minutes.split("").map((digit, i) => (
                                <NumberFlow
                                    key={`min-${i}`}
                                    value={parseInt(digit) as Value}
                                    trend={0}
                                    format={{ notation: "compact" }}
                                    className={cn(
                                        "text-center font-bold",
                                        sizeClass.digit,
                                        colorClass
                                    )}
                                />
                            ))}
                        </div>
                        <span className={cn(
                            "ml-1 lg:ml-2 font-bold",
                            sizeClass.ampm,
                            colorClass
                        )}>
                            {ampm}
                        </span>
                    </div>
                );
        }
    };

    return (
        <div className={cn(
            disableBackground 
                ? "" 
                : "px-3 py-2 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl bg-background/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800",
            position === "center" ? "flex flex-col items-center" : ""
        )}>
            {renderClockContent()}
        </div>
    );
};

export default Time;

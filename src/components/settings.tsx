"use client";

import { useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { RiSettingsLine, RiSaveLine, RiRestartLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import NumberInput from "./number-input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Maximize2, Minimize2 } from "lucide-react";
import { type ClockStyle, type ClockPosition, type ClockColor, type ClockSize } from "./time";

type PomodoroSettings = {
    work: number;
    break: number;
    longBreak: number;
};

type AppSettings = {
    clockStyle: ClockStyle;
    clockPosition: ClockPosition;
    disableClockBackground: boolean;
    clockColor: ClockColor;
    clockSize: ClockSize;
};

const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
    work: 25,
    break: 5,
    longBreak: 15,
};

const DEFAULT_APP_SETTINGS: AppSettings = {
    clockStyle: "digital",
    clockPosition: "corner",
    disableClockBackground: false,
    clockColor: "white",
    clockSize: "medium",
};

const Settings = () => {
    const [pomodoroSettings, setPomodoroSettings] =
        useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
    const [appSettings, setAppSettings] =
        useState<AppSettings>(DEFAULT_APP_SETTINGS);
    const [open, setOpen] = useState(false);
    
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        try {
            const savedStyle = localStorage.getItem("clockStyle");
            if (savedStyle && ["digital", "analog", "minimal", "text"].includes(savedStyle)) {
                setAppSettings(prev => ({ ...prev, clockStyle: savedStyle as ClockStyle }));
            }
            
            const savedPosition = localStorage.getItem("clockPosition");
            if (savedPosition === "center" || savedPosition === "corner") {
                setAppSettings(prev => ({ ...prev, clockPosition: savedPosition as ClockPosition }));
            }
            
            const savedDisableBackground = localStorage.getItem("disableClockBackground");
            if (savedDisableBackground === "true") {
                setAppSettings(prev => ({ ...prev, disableClockBackground: true }));
            }
        } catch (error) {
            console.error("Error loading app settings:", error);
        }
    }, []);

    useEffect(() => {
        try {
            const savedPomodoroSettings = localStorage.getItem("pomodoroSettings");
            if (savedPomodoroSettings) {
                setPomodoroSettings(JSON.parse(savedPomodoroSettings));
            }
        } catch (error) {
            console.error("Error loading pomodoro settings:", error);
        }
    }, []);

    const handleSave = () => {
        if (typeof window === 'undefined') return;
        
        try {
            localStorage.setItem("pomodoroSettings", JSON.stringify(pomodoroSettings));
            
            localStorage.setItem("clockStyle", appSettings.clockStyle);
            localStorage.setItem("clockPosition", appSettings.clockPosition);
            localStorage.setItem("disableClockBackground", String(appSettings.disableClockBackground));
            localStorage.setItem("clockColor", appSettings.clockColor);
            localStorage.setItem("clockSize", appSettings.clockSize);
            
            setOpen(false);
            
            const clockEvent = new CustomEvent("clockSettingsChanged", {
                detail: {
                    style: appSettings.clockStyle,
                    position: appSettings.clockPosition,
                    disableBackground: appSettings.disableClockBackground,
                    color: appSettings.clockColor,
                    size: appSettings.clockSize
                }
            });
            
            window.dispatchEvent(new Event("pomodoroSettingsChanged"));
            window.dispatchEvent(clockEvent);
            
            if (typeof window !== 'undefined') {
                // @ts-ignore
                window.__updateClockStyle = appSettings.clockStyle;
                // @ts-ignore
                window.__updateClockBackground = appSettings.disableClockBackground;
                // @ts-ignore
                window.__updateClockColor = appSettings.clockColor;
                // @ts-ignore
                window.__updateClockSize = appSettings.clockSize;
            }
            
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings");
        }
    };

    const handleReset = () => {
        if (typeof window === 'undefined') return;
        
        try {
            setPomodoroSettings(DEFAULT_POMODORO_SETTINGS);
            localStorage.removeItem("pomodoroSettings");
            
            const defaultAppSettings = {
                clockStyle: "digital" as ClockStyle,
                clockPosition: "corner" as ClockPosition,
                disableClockBackground: false,
                clockColor: "white" as ClockColor,
                clockSize: "medium" as ClockSize
            };
            
            setAppSettings(defaultAppSettings);
            
            localStorage.setItem("clockStyle", defaultAppSettings.clockStyle);
            localStorage.setItem("clockPosition", defaultAppSettings.clockPosition);
            localStorage.setItem("disableClockBackground", String(defaultAppSettings.disableClockBackground));
            localStorage.setItem("clockColor", defaultAppSettings.clockColor);
            localStorage.setItem("clockSize", defaultAppSettings.clockSize);
            
            window.dispatchEvent(new Event("pomodoroSettingsChanged"));
            window.dispatchEvent(new Event("clockSettingsChanged"));
            
            toast.success("Settings reset to default!");
        } catch (error) {
            console.error("Error resetting settings:", error);
            toast.error("Failed to reset settings");
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger
                            className="cursor-pointer w-10 h-10 rounded flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-md hover:bg-background/90 transition-colors"
                            aria-label="Settings"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <RiSettingsLine className="text-zinc-900 dark:text-zinc-100 w-5 h-5" />
                            </motion.div>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Settings</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-80 p-4 bg-background/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <h5 className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">
                            Settings
                        </h5>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleReset}
                            className="h-8 w-8"
                        >
                            <RiRestartLine className="h-4 w-4" />
                        </Button>
                    </div>
                    <Separator className="bg-zinc-200 dark:bg-zinc-700" />
                    

                    <div>
                        <h6 className="text-sm font-medium mb-3 text-zinc-500 dark:text-zinc-400">
                            Clock Settings
                        </h6>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="clockStyle">Clock Style</Label>
                                <Select
                                    value={appSettings.clockStyle}
                                    onValueChange={(value: ClockStyle) => {
                                        setAppSettings({
                                            ...appSettings,
                                            clockStyle: value,
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="digital">Digital</SelectItem>
                                        <SelectItem value="analog">Analog</SelectItem>
                                        <SelectItem value="minimal">Minimal</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="clockPosition">Clock Position</Label>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {appSettings.clockPosition === "corner" ? "Corner" : "Center"}
                                    </span>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 px-2 text-xs"
                                        onClick={() => setAppSettings({
                                            ...appSettings,
                                            clockPosition: appSettings.clockPosition === "corner" ? "center" : "corner"
                                        })}
                                    >
                                        {appSettings.clockPosition === "corner" ? (
                                            <Maximize2 className="h-3.5 w-3.5 mr-1" />
                                        ) : (
                                            <Minimize2 className="h-3.5 w-3.5 mr-1" />
                                        )}
                                        {appSettings.clockPosition === "corner" ? "Center" : "Corner"}
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="clockColor">Clock Color</Label>
                                <Select
                                    value={appSettings.clockColor}
                                    onValueChange={(value: ClockColor) => {
                                        setAppSettings({
                                            ...appSettings,
                                            clockColor: value,
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="white">White</SelectItem>
                                        <SelectItem value="gray">Gray</SelectItem>
                                        <SelectItem value="blue">Blue</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="red">Red</SelectItem>
                                        <SelectItem value="purple">Purple</SelectItem>
                                        <SelectItem value="yellow">Yellow</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="clockSize">Clock Size</Label>
                                <Select
                                    value={appSettings.clockSize}
                                    onValueChange={(value: ClockSize) => {
                                        setAppSettings({
                                            ...appSettings,
                                            clockSize: value,
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="small">Small</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="large">Large</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <Label htmlFor="disableClockBackground" className="cursor-pointer">
                                    Disable Clock Background
                                </Label>
                                <Switch
                                    id="disableClockBackground"
                                    checked={appSettings.disableClockBackground}
                                    onCheckedChange={(checked) =>
                                        setAppSettings({
                                            ...appSettings,
                                            disableClockBackground: checked,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="bg-zinc-200 dark:bg-zinc-700" />
                    

                    <div>
                        <h6 className="text-sm font-medium mb-3 text-zinc-500 dark:text-zinc-400">
                            Timer Settings
                        </h6>
                        <div className="space-y-4">
                            <div>
                                <h6 className="text-sm font-medium mb-3 text-zinc-500 dark:text-zinc-400">
                                    Focus Session
                                </h6>
                                <div className="space-y-2">
                                    <Label htmlFor="work">Duration (minutes)</Label>
                                    <NumberInput
                                        value={pomodoroSettings.work}
                                        onChange={(value) =>
                                            setPomodoroSettings({
                                                ...pomodoroSettings,
                                                work: value,
                                            })
                                        }
                                        min={1}
                                        max={60}
                                    />
                                </div>
                            </div>
                            <div>
                                <h6 className="text-sm font-medium mb-3 text-zinc-500 dark:text-zinc-400">
                                    Break Times
                                </h6>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="break">
                                            Short Break (minutes)
                                        </Label>
                                        <NumberInput
                                            value={pomodoroSettings.break}
                                            onChange={(value) =>
                                                setPomodoroSettings({
                                                    ...pomodoroSettings,
                                                    break: value,
                                                })
                                            }
                                            min={1}
                                            max={30}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longBreak">
                                            Long Break (minutes)
                                        </Label>
                                        <NumberInput
                                            value={pomodoroSettings.longBreak}
                                            onChange={(value) =>
                                                setPomodoroSettings({
                                                    ...pomodoroSettings,
                                                    longBreak: value,
                                                })
                                            }
                                            min={1}
                                            max={60}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Separator className="bg-zinc-200 dark:bg-zinc-700" />
                    <Button className="w-full" onClick={handleSave}>
                        <RiSaveLine className="mr-2 h-4 w-4" />
                        Save Settings
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default Settings;

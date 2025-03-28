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

type PomodoroSettings = {
    work: number;
    break: number;
    longBreak: number;
};

const DEFAULT_SETTINGS: PomodoroSettings = {
    work: 25,
    break: 5,
    longBreak: 15,
};

const Settings = () => {
    const [settings, setSettings] =
        useState<PomodoroSettings>(DEFAULT_SETTINGS);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem("pomodoroSettings");
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
        setOpen(false);
        window.dispatchEvent(new Event("pomodoroSettingsChanged"));
        toast.success("Settings saved successfully!");
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem("pomodoroSettings");
        window.dispatchEvent(new Event("pomodoroSettingsChanged"));
        toast.success("Settings reset to default!");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                className="cursor-pointer w-14 h-14 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-md hover:bg-background/90 transition-colors"
                aria-label="Settings"
            >
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <RiSettingsLine className="text-zinc-900 dark:text-zinc-100 w-6 h-6" />
                </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-background/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <h5 className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">
                            Timer Settings
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
                    <div className="space-y-4">
                        <div>
                            <h6 className="text-sm font-medium mb-3 text-zinc-500 dark:text-zinc-400">
                                Focus Session
                            </h6>
                            <div className="space-y-2">
                                <Label htmlFor="work">Duration (minutes)</Label>
                                <NumberInput
                                    value={settings.work}
                                    onChange={(value) =>
                                        setSettings({
                                            ...settings,
                                            work: value,
                                        })
                                    }
                                    min={1}
                                    max={60}
                                />
                            </div>
                        </div>
                        <Separator className="bg-zinc-200 dark:bg-zinc-700" />
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
                                        value={settings.break}
                                        onChange={(value) =>
                                            setSettings({
                                                ...settings,
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
                                        value={settings.longBreak}
                                        onChange={(value) =>
                                            setSettings({
                                                ...settings,
                                                longBreak: value,
                                            })
                                        }
                                        min={1}
                                        max={60}
                                    />
                                </div>
                            </div>
                        </div>
                        <Separator className="bg-zinc-200 dark:bg-zinc-700" />
                        <Button className="w-full" onClick={handleSave}>
                            <RiSaveLine className="mr-2 h-4 w-4" />
                            Save Settings
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default Settings;

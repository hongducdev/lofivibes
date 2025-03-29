"use client";

import {
    RiVolumeMuteLine,
    RiVolumeUpLine,
    RiRainyLine,
    RiCarLine,
    RiGroupLine,
    RiWaterFlashLine,
    RiWindyLine,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSoundStore } from "@/lib/store";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

const SoundControls = () => {
    const {
        isRaining,
        isCityTraffic,
        isPeopleTalking,
        isWaves,
        isWind,
        volume,
        toggleRain,
        toggleCityTraffic,
        togglePeopleTalking,
        toggleWaves,
        toggleWind,
        setVolume,
    } = useSoundStore();

    const sounds = [
        {
            name: "Rain",
            isActive: isRaining,
            toggle: toggleRain,
            icon: <RiRainyLine className="w-5 h-5" />,
        },
        {
            name: "City Traffic",
            isActive: isCityTraffic,
            toggle: toggleCityTraffic,
            icon: <RiCarLine className="w-5 h-5" />,
        },
        {
            name: "People",
            isActive: isPeopleTalking,
            toggle: togglePeopleTalking,
            icon: <RiGroupLine className="w-5 h-5" />,
        },
        {
            name: "Waves",
            isActive: isWaves,
            toggle: toggleWaves,
            icon: <RiWaterFlashLine className="w-5 h-5" />,
        },
        {
            name: "Wind",
            isActive: isWind,
            toggle: toggleWind,
            icon: <RiWindyLine className="w-5 h-5" />,
        },
    ];

    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 p-2 rounded-2xl bg-background/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 group">
            <div className="flex flex-col gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={volume === 0 ? "Unmute" : "Mute"}
                    onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                >
                    {volume === 0 ? (
                        <RiVolumeMuteLine className="w-5 h-5" />
                    ) : (
                        <RiVolumeUpLine className="w-5 h-5" />
                    )}
                </Button>
                {sounds.map((sound) => (
                    <TooltipProvider key={sound.name}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={
                                        sound.isActive ? "default" : "outline"
                                    }
                                    size="icon"
                                    onClick={sound.toggle}
                                    className="relative"
                                    aria-label={`Toggle ${sound.name} sound`}
                                >
                                    <motion.span
                                        initial={{ scale: 1 }}
                                        animate={{
                                            scale: sound.isActive
                                                ? [1, 1.2, 1]
                                                : 1,
                                        }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {sound.icon}
                                    </motion.span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>{sound.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
            <div className="absolute right-full mr-2 overflow-hidden transition-all duration-300 opacity-0 scale-x-0 origin-right group-hover:opacity-100 group-hover:scale-x-100">
                <div className="p-2 rounded-lg bg-background/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800">
                    <Slider
                        value={[volume]}
                        max={1}
                        step={0.1}
                        onValueChange={(value) => setVolume(value[0])}
                        className="h-32 w-[6px]"
                        orientation="vertical"
                        aria-label="Volume"
                    />
                </div>
            </div>
        </div>
    );
};

export default SoundControls;

"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    backgroundConfig,
    type BackgroundVideo,
} from "@/config/background-config";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChangeBackgroundProps {
    currentBackground: BackgroundVideo;
    onBackgroundChange: (background: BackgroundVideo) => void;
}

export default function ChangeBackground({
    currentBackground,
    onBackgroundChange,
}: ChangeBackgroundProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="sm"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-500 bg-background/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-lg transition-all duration-300 hover:bg-background/90 h-[38px]"
                >
                    <Image
                        src={`${currentBackground.url}/${currentBackground.image}`}
                        alt={currentBackground.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-cover rounded"
                    />
                    <span>Change Scene</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[400px] p-4">
                <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-2 gap-3">
                        {backgroundConfig.map((background) => (
                            <Button
                                key={background.name}
                                variant="ghost"
                                onClick={() => {
                                    onBackgroundChange(background);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "group flex h-auto flex-col items-start gap-2 p-2",
                                    currentBackground.name ===
                                        background.name && "bg-accent"
                                )}
                            >
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                    <Image
                                        src={`${background.url}/${background.image}`}
                                        alt={background.name}
                                        width={320}
                                        height={180}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                </div>
                                <span className="font-medium">
                                    {background.name}
                                </span>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

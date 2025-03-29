"use client";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { authorConfig } from "@/config/author-config";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    RiUserLine,
    RiGithubFill,
    RiGlobalLine,
    RiCupLine,
    RiQrCodeLine,
} from "react-icons/ri";
import { RiTwitterXFill } from "react-icons/ri";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap = {
    github: RiGithubFill,
    x: RiTwitterXFill,
    globe: RiGlobalLine,
} as const;

const AboutMe = () => {
    return (
        <Popover>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger
                            className="cursor-pointer w-14 h-14 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-md hover:bg-background/90 transition-colors"
                            aria-label="About me"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <RiUserLine className="text-zinc-900 dark:text-zinc-100 w-6 h-6" />
                            </motion.div>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>About Me</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-80 p-4 bg-background/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between w-full">
                        <h5 className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">
                            About Me
                        </h5>
                    </div>
                    <Separator className="bg-zinc-200 dark:bg-zinc-700" />
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden">
                            <Image
                                src={authorConfig.avatar}
                                alt={authorConfig.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {authorConfig.name}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {authorConfig.bio}
                            </p>
                        </div>
                        <Separator className="bg-zinc-200 dark:bg-zinc-700" />
                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center justify-center space-x-4">
                                {authorConfig.links.map((link) => {
                                    const Icon =
                                        iconMap[
                                            link.icon as keyof typeof iconMap
                                        ];
                                    return (
                                        <motion.a
                                            key={link.name}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </motion.a>
                                    );
                                })}
                            </div>
                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <motion.a
                                        href={authorConfig.buyMeACoffee}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <RiCupLine className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            Buy me a coffee
                                        </span>
                                        <RiQrCodeLine className="w-4 h-4 ml-1 opacity-75" />
                                    </motion.a>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-fit p-2 bg-white dark:bg-zinc-900">
                                    <Image
                                        src="/bmc_qr.png"
                                        alt="Buy Me a Coffee QR Code"
                                        width={200}
                                        height={200}
                                        className="rounded-lg"
                                    />
                                    <p className="text-xs text-center mt-2 text-zinc-500 dark:text-zinc-400">
                                        Scan to support my work
                                    </p>
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default AboutMe;

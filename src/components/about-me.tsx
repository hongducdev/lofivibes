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
import { RiUserLine, RiGithubFill, RiGlobalLine } from "react-icons/ri";
import { RiTwitterXFill } from "react-icons/ri";

const iconMap = {
    github: RiGithubFill,
    x: RiTwitterXFill,
    globe: RiGlobalLine,
} as const;

const AboutMe = () => {
    return (
        <Popover>
            <PopoverTrigger className="cursor-pointer w-14 h-14 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <RiUserLine className="text-zinc-900 dark:text-zinc-100 w-6 h-6" />
                </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-zinc-50 dark:bg-zinc-800">
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
                        <div className="flex items-center justify-center space-x-4">
                            {authorConfig.links.map((link) => {
                                const Icon =
                                    iconMap[link.icon as keyof typeof iconMap];
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
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default AboutMe;

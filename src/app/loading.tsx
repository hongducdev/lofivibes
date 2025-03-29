"use client";

import React from "react";
import { motion } from "framer-motion";

const Loading = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative">
                <motion.div
                    className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-800 rounded-full"
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                <motion.div
                    className="absolute inset-0 border-4 border-t-primary rounded-full"
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </div>
            <motion.span
                className="absolute mt-24 text-sm text-zinc-500 dark:text-zinc-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.3,
                    delay: 0.5,
                }}
            >
                Loading...
            </motion.span>
        </div>
    );
};

export default Loading;

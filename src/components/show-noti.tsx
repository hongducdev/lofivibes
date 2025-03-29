"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Keyboard } from "lucide-react";

interface ShowNotiProps {
    show: boolean;
    setShow: (show: boolean) => void;
}

export const ShowNoti = ({ show, setShow }: ShowNotiProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, 10000);

        return () => clearTimeout(timer);
    }, [setShow]);

    const handleShowGuide = () => {
        setShow(true);
        const timer = setTimeout(() => {
            setShow(false);
        }, 10000);
        return () => clearTimeout(timer);
    };

    return (
        <>
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed bottom-24 left-6 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md p-4 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 max-w-[300px] z-[100]"
                    >
                        <div className="relative">
                            <p className="text-zinc-900 dark:text-white/80 text-sm leading-relaxed">
                                Keyboard shortcuts:{" "}
                                <span className="block mt-2 space-y-2">
                                    <span className="flex items-center gap-2">
                                        <kbd className="px-2 py-1 bg-zinc-100/80 dark:bg-white/10 rounded-md font-mono text-zinc-900 dark:text-white">
                                            Space
                                        </kbd>
                                        <span>Play/pause</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <kbd className="px-2 py-1 bg-zinc-100/80 dark:bg-white/10 rounded-md font-mono text-zinc-900 dark:text-white">
                                            ↑
                                        </kbd>
                                        <span>Increase volume</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <kbd className="px-2 py-1 bg-zinc-100/80 dark:bg-white/10 rounded-md font-mono text-zinc-900 dark:text-white">
                                            ↓
                                        </kbd>
                                        <span>Decrease volume</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <kbd className="px-2 py-1 bg-zinc-100/80 dark:bg-white/10 rounded-md font-mono text-zinc-900 dark:text-white">
                                            ←
                                        </kbd>
                                        <span>Previous channel</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <kbd className="px-2 py-1 bg-zinc-100/80 dark:bg-white/10 rounded-md font-mono text-zinc-900 dark:text-white">
                                            →
                                        </kbd>
                                        <span>Next channel</span>
                                    </span>
                                </span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!show && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShowGuide}
                    className="fixed bottom-6 left-6 w-10 h-10 rounded flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-md hover:bg-background/90 transition-colors"
                    aria-label="Show keyboard shortcuts"
                >
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Keyboard className="text-zinc-900 dark:text-zinc-100 w-5 h-5" />
                    </motion.div>
                </Button>
            )}
        </>
    );
};

export default ShowNoti;

"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Chat } from "./chat";
import { motion, AnimatePresence } from "framer-motion";

const NotificationBadge = ({ count }: { count: number }) => (
    <div className="absolute -top-1 -right-1">
        <span className="relative flex h-4 w-4">
            <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
                animate={{
                    scale: [1, 1.5],
                    opacity: [0.75, 0],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                }}
            />
            <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
                animate={{
                    scale: [1, 1.5],
                    opacity: [0.75, 0],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                    delay: 0.3,
                }}
            />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary items-center justify-center">
                <span className="text-[10px] font-medium text-primary-foreground">
                    {count > 99 ? "99+" : count}
                </span>
            </span>
        </span>
    </div>
);

const ActiveUsers = () => {
    const [activeUsers, setActiveUsers] = useState<number>(0);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        const channel = pusherClient.subscribe("presence-lofi");
        const chatChannel = pusherClient.subscribe("chat");

        channel.bind(
            "pusher:subscription_succeeded",
            (members: { count: number }) => {
                setActiveUsers(members.count);
            }
        );

        channel.bind("pusher:member_added", () => {
            setActiveUsers((count) => count + 1);
        });

        channel.bind("pusher:member_removed", () => {
            setActiveUsers((count) => Math.max(0, count - 1));
        });

        chatChannel.bind("message", () => {
            if (!isOpen) {
                setUnreadCount((count) => count + 1);
            }
        });

        return () => {
            channel.unbind_all();
            chatChannel.unbind_all();
            pusherClient.unsubscribe("presence-lofi");
            pusherClient.unsubscribe("chat");
        };
    }, [isOpen]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setUnreadCount(0);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-500 bg-background/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-lg transition-all duration-300 hover:bg-background/90 relative">
                    <Users className="h-4 w-4 text-zinc-800 dark:text-zinc-500" />
                    <span className="font-medium">{activeUsers} online</span>
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <NotificationBadge count={unreadCount} />
                        )}
                    </AnimatePresence>
                </button>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-80 p-0 mb-6">
                <Chat />
            </PopoverContent>
        </Popover>
    );
};

export default ActiveUsers;

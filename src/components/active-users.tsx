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

const ActiveUsers = () => {
    const [activeUsers, setActiveUsers] = useState<number>(0);

    useEffect(() => {
        const channel = pusherClient.subscribe("presence-lofi");

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

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe("presence-lofi");
        };
    }, []);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500 bg-background/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-lg transition-all duration-300 hover:bg-background/90">
                    <Users className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    <span className="font-medium">{activeUsers} online</span>
                </button>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-80 p-0">
                <Chat />
            </PopoverContent>
        </Popover>
    );
};

export default ActiveUsers;

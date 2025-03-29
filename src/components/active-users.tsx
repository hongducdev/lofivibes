"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Users } from "lucide-react";

const ActiveUsers = () => {
    const [activeUsers, setActiveUsers] = useState<number>(0);

    useEffect(() => {
        const socket = io(
            process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3000"
        );

        socket.on("connect", () => {
            console.log("Connected to WebSocket server");
        });

        socket.on("activeUsers", (count: number) => {
            setActiveUsers(count);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500 bg-background/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-lg transition-all duration-300 hover:bg-background/90">
            <Users className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <span className="font-medium">{activeUsers} online</span>
        </div>
    );
};

export default ActiveUsers;

"use client";

import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

interface Message {
    id: string;
    text: string;
    sender: string;
    timestamp: number;
}

const MessageSkeleton = () => (
    <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-[80%]" />
    </div>
);

const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <MessageCircle className="h-12 w-12 mb-2" />
        <p>No messages yet</p>
        <p className="text-sm">Be the first to start the conversation!</p>
    </div>
);

const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const formatFullDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [username] = useState(
        `User_${Math.random().toString(36).slice(2, 7)}`
    );
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/chat")
            .then((res) => res.json())
            .then((data) => {
                setMessages(data.reverse());
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error loading messages:", error);
                setIsLoading(false);
            });

        const channel = pusherClient.subscribe("chat");

        channel.bind("message", (data: Message) => {
            setMessages((prev) => {
                if (prev.some((msg) => msg.id === data.id)) {
                    return prev;
                }
                return [...prev, data];
            });
        });

        return () => {
            pusherClient.unsubscribe("chat");
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            text: newMessage,
            sender: username,
            timestamp: Date.now(),
        };

        try {
            await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(message),
            });
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div>
            <div className="p-4 border-b">
                <h3 className="font-semibold">Chat Room</h3>
            </div>
            <div className="h-96 overflow-y-auto p-4">
                {isLoading ? (
                    <>
                        <MessageSkeleton />
                        <MessageSkeleton />
                        <MessageSkeleton />
                    </>
                ) : messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "mb-4 p-2 rounded-lg max-w-[80%]",
                                msg.sender === username
                                    ? "ml-auto bg-primary text-primary-foreground"
                                    : "bg-muted"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold">
                                    {msg.sender}
                                </p>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <span className="text-xs opacity-70">
                                                {formatTimestamp(msg.timestamp)}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {formatFullDate(msg.timestamp)}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <p>{msg.text}</p>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading}
                        className="px-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                            {isLoading ? "Sending message" : "Send message"}
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    );
};

"use client";

import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Message {
    id: string;
    text: string;
    sender: string;
    timestamp: number;
}

export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [username] = useState(
        `User_${Math.random().toString(36).slice(2, 7)}`
    );
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/chat")
            .then((res) => res.json())
            .then((data) => setMessages(data.reverse()))
            .catch((error) => console.error("Error loading messages:", error));

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
        <div className="fixed bottom-4 right-4 w-80 bg-background border rounded-lg shadow-lg">
            <div className="p-4 border-b">
                <h3 className="font-semibold">Chat Room</h3>
            </div>
            <div className="h-96 overflow-y-auto p-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "mb-4 p-2 rounded-lg max-w-[80%]",
                            msg.sender === username
                                ? "ml-auto bg-primary text-primary-foreground"
                                : "bg-muted"
                        )}
                    >
                        <p className="text-sm font-medium">{msg.sender}</p>
                        <p>{msg.text}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="sm">
                        Send
                    </Button>
                </div>
            </form>
        </div>
    );
};

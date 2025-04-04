"use client";

import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { MessageCircle, Send, Loader2, Edit2, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
    const [isSending, setIsSending] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [username, setUsername] = useState<string>(() => {
        if (typeof window !== "undefined") {
            const savedUsername = localStorage.getItem("chatUsername");
            return (
                savedUsername ||
                `User_${Math.random().toString(36).slice(2, 7)}`
            );
        }
        return `User_${Math.random().toString(36).slice(2, 7)}`;
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("chatUsername", username);
        }
    }, [username]);

    useEffect(() => {
        if (isEditingName && usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, [isEditingName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const message = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            text: newMessage,
            sender: username,
            timestamp: Date.now(),
        };

        try {
            setIsSending(true);
            await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(message),
            });
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleUsernameChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim()) return;

        setUsername(newUsername.trim());
        setNewUsername("");
        setIsEditingName(false);
    };

    const handleUsernameKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Escape") {
            setIsEditingName(false);
            setNewUsername("");
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        const cursor =
            messageInputRef.current?.selectionStart || newMessage.length;
        const newMessageWithEmoji =
            newMessage.slice(0, cursor) +
            emojiData.emoji +
            newMessage.slice(cursor);

        setNewMessage(newMessageWithEmoji);
        setShowEmojiPicker(false);
        messageInputRef.current?.focus();
    };

    return (
        <div>
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Chat Room</h3>
                    <Dialog
                        open={isEditingName}
                        onOpenChange={setIsEditingName}
                    >
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 hover:bg-muted"
                                aria-label="Edit username"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Change Username</DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleUsernameChange}
                                className="space-y-4 mt-2"
                            >
                                <div className="space-y-2">
                                    <Input
                                        ref={usernameInputRef}
                                        value={newUsername}
                                        onChange={(e) =>
                                            setNewUsername(e.target.value)
                                        }
                                        onKeyDown={handleUsernameKeyDown}
                                        placeholder="Enter new username"
                                        className="flex-1"
                                        aria-label="New username"
                                        maxLength={30}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Current username: {username}
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditingName(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!newUsername.trim()}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setIsEditingName(true)}
                                aria-label="Show username"
                            >
                                {username}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Click to change your username</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
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
                    <div className="relative flex-1 flex gap-2">
                        <Popover
                            open={showEmojiPicker}
                            onOpenChange={setShowEmojiPicker}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 hover:bg-muted"
                                    aria-label="Add emoji"
                                >
                                    <Smile className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                side="top"
                                align="start"
                                className="w-full p-0 mb-2"
                            >
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    width="100%"
                                    height={400}
                                />
                            </PopoverContent>
                        </Popover>
                        <Input
                            ref={messageInputRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                            disabled={isLoading || isSending}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading || isSending || !newMessage.trim()}
                        className="px-2"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                            {isSending ? "Sending message" : "Send message"}
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    );
};

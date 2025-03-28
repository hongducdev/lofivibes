"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import YouTube, { YouTubePlayer, YouTubeEvent } from "react-youtube";
import {
    Volume2,
    VolumeX,
    Play,
    Pause,
    SkipForward,
    Radio,
    Maximize2,
    Minimize2,
    PictureInPicture2,
} from "lucide-react";
import { Button } from "./ui/button";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Slider } from "./ui/slider";

interface Channel {
    id: string;
    name: string;
    description: string;
}

const CHANNELS: Channel[] = [
    {
        id: "jfKfPfyJRdk",
        name: "Lofi Girl",
        description:
            "The original lofi hip hop radio - beats to relax/study to",
    },
    {
        id: "WelpRyoV0UY",
        name: "Chill with Taiki",
        description: "lofi hip hop radio 🌿 chill beats to relax/study to",
    },
    {
        id: "7NOSDKb0HlU",
        name: "Coffee Shop Radio",
        description: "Relaxing jazz & bossa nova music for work and study",
    },
    {
        id: "Na0w3Mz46GA",
        name: "Lofi Girl",
        description: "asian lofi radio ⛩️ beats to relax/study to",
    },
    {
        id: "5yx6BWlEVcY",
        name: "Chillhop Radio",
        description: "Jazzy & lofi hip hop beats - chillhop music",
    },
];

export const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [currentChannel, setCurrentChannel] = useState<Channel>(CHANNELS[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const playerRef = useRef<YouTubePlayer>(null);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    const opts = {
        height: "100%",
        width: "100%",
        playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            mute: 0,
            hd: 1,
            vq: "hd1080",
            enablejsapi: 1,
            origin: window.location.origin,
        },
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            playerRef.current?.pauseVideo();
        } else {
            playerRef.current?.playVideo();
            playerRef.current?.setPlaybackQuality("hd1080");
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
        }
    };

    const handleChannelChange = (channel: Channel) => {
        setCurrentChannel(channel);
        if (isPlaying) {
            setIsPlaying(false);
            setTimeout(() => {
                setIsPlaying(true);
            }, 500);
        }
    };

    const onReady = (event: YouTubeEvent) => {
        playerRef.current = event.target;
        event.target.setPlaybackQuality("hd1080");
    };

    const handleFullscreen = useCallback(async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    const handlePictureInPicture = useCallback(async () => {
        if (!playerRef.current) return;

        try {
            const iframe = playerRef.current.getIframe();
            if (!iframe) return;

            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await iframe.requestPictureInPicture();
            }
        } catch (error) {
            console.error("Failed to enter Picture-in-Picture mode:", error);
        }
    }, []);

    return (
        <>
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-black/30 z-10" />
                <div className="relative w-screen h-screen">
                    <YouTube
                        videoId={currentChannel.id}
                        opts={opts}
                        onReady={onReady}
                        className="w-full h-full"
                        iframeClassName="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover"
                    />
                </div>
            </div>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md p-6 rounded-2xl shadow-lg z-50 w-[400px] transition-all duration-300 hover:bg-background/90">
                <div className="flex flex-col gap-4">
                    {/* Channel info */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-lg">
                                {currentChannel.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {currentChannel.description}
                            </p>
                        </div>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-primary/20"
                                >
                                    <Radio className="h-5 w-5" />
                                </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 p-2" side="top">
                                <div className="space-y-2">
                                    {CHANNELS.map((channel) => (
                                        <Button
                                            key={channel.id}
                                            variant="ghost"
                                            className="w-full justify-start gap-2 h-auto py-2"
                                            onClick={() =>
                                                handleChannelChange(channel)
                                            }
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">
                                                    {channel.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {channel.description}
                                                </span>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePlayPause}
                                className="hover:bg-primary/20"
                            >
                                {isPlaying ? (
                                    <Pause className="h-6 w-6" />
                                ) : (
                                    <Play className="h-6 w-6" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    const currentIndex = CHANNELS.findIndex(
                                        (c) => c.id === currentChannel.id
                                    );
                                    const nextIndex =
                                        (currentIndex + 1) % CHANNELS.length;
                                    handleChannelChange(CHANNELS[nextIndex]);
                                }}
                                className="hover:bg-primary/20"
                            >
                                <SkipForward className="h-6 w-6" />
                            </Button>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setVolume(volume === 0 ? 50 : 0)
                                    }
                                    className="hover:bg-primary/20"
                                >
                                    {volume === 0 ? (
                                        <VolumeX className="h-6 w-6" />
                                    ) : (
                                        <Volume2 className="h-6 w-6" />
                                    )}
                                </Button>
                                <Slider
                                    value={[volume]}
                                    min={0}
                                    max={100}
                                    onValueChange={handleVolumeChange}
                                    className="w-24"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-primary/20"
                                onClick={handlePictureInPicture}
                                aria-label="Toggle picture in picture"
                            >
                                <PictureInPicture2 className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-primary/20"
                                onClick={handleFullscreen}
                                aria-label="Toggle fullscreen"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-5 w-5" />
                                ) : (
                                    <Maximize2 className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

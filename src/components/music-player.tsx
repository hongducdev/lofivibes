"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import YouTube, { YouTubePlayer, YouTubeEvent } from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";
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
        description: "lofi hip hop radio chill beats to relax/study to",
    },
    {
        id: "7NOSDKb0HlU",
        name: "Coffee Shop Radio",
        description: "Relaxing jazz & bossa nova music for work and study",
    },
    {
        id: "Na0w3Mz46GA",
        name: "Lofi Girl",
        description: "asian lofi radio beats to relax/study to",
    },
    {
        id: "5yx6BWlEVcY",
        name: "Chillhop Radio",
        description: "Jazzy & lofi hip hop beats - chillhop music",
    },
];

export const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);
    const [currentChannel, setCurrentChannel] = useState<Channel>(CHANNELS[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const playerRef = useRef<YouTubePlayer>(null);
    const autoPlayTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const opts = {
        width: "100%",
        height: "100%",
        playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            loop: 1,
            playlist: currentChannel.id,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            mute: 0,
        },
    };

    const controlsVariants = {
        hidden: {
            height: 0,
            opacity: 0,
            transition: {
                height: { duration: 0.2 },
                opacity: { duration: 0.1 },
            },
        },
        visible: {
            height: "auto",
            opacity: 1,
            transition: {
                height: { duration: 0.2 },
                opacity: { duration: 0.2, delay: 0.1 },
            },
        },
    };

    const controlsContentVariants = {
        hidden: {
            y: -8,
            opacity: 0,
        },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.2,
                delay: 0.1,
            },
        },
    };

    const handlePlayPause = useCallback(() => {
        if (isPlaying) {
            playerRef.current?.pauseVideo();
        } else {
            playerRef.current?.playVideo();
            playerRef.current?.setPlaybackQuality("hd1080");
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleVolumeChange = useCallback((value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
        }
    }, []);

    const handleChannelChange = useCallback(
        (channel: Channel) => {
            setCurrentChannel(channel);
            if (isPlaying) {
                if (autoPlayTimeoutRef.current) {
                    clearTimeout(autoPlayTimeoutRef.current);
                }
                autoPlayTimeoutRef.current = setTimeout(() => {
                    playerRef.current?.playVideo();
                }, 1000);
            }
        },
        [isPlaying]
    );

    const handleKeyPress = useCallback(
        (e: KeyboardEvent) => {
            if (
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA"
            )
                return;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    const newVolumeUp = Math.min(volume + 5, 100);
                    handleVolumeChange([newVolumeUp]);
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    const newVolumeDown = Math.max(volume - 5, 0);
                    handleVolumeChange([newVolumeDown]);
                    break;
                case "ArrowLeft":
                case "ArrowRight":
                    e.preventDefault();
                    const currentIndex = CHANNELS.findIndex(
                        (c) => c.id === currentChannel.id
                    );
                    const nextIndex =
                        e.code === "ArrowRight"
                            ? (currentIndex + 1) % CHANNELS.length
                            : (currentIndex - 1 + CHANNELS.length) %
                              CHANNELS.length;
                    handleChannelChange(CHANNELS[nextIndex]);
                    break;
            }
        },
        [
            volume,
            currentChannel,
            handleVolumeChange,
            handlePlayPause,
            handleChannelChange,
        ]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [handleKeyPress]);

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

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 1024);
        };

        // Check initial
        checkMobile();

        // Add event listener
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const onReady = (event: YouTubeEvent) => {
        playerRef.current = event.target;
        if (playerRef.current) {
            playerRef.current.setVolume(volume);
        }
    };

    const onStateChange = (event: YouTubeEvent) => {
        switch (event.data) {
            case 1: // playing
                setIsPlaying(true);
                break;
            case 2: // paused
                setIsPlaying(false);
                break;
        }
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
            <div className="fixed inset-0 -z-20 opacity-0 pointer-events-none">
                <YouTube
                    videoId={currentChannel.id}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="w-full h-full"
                />
            </div>
            <motion.div
                className="fixed lg:bottom-6 left-1/2 bg-background/80 backdrop-blur-md p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg z-50 w-[95%] max-w-[400px] sm:w-[400px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ x: "-50%" }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <div className="flex flex-col gap-4">
                    {/* Channel info */}
                    <div className="flex items-center justify-between">
                        <motion.div
                            className="flex flex-col"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className="font-semibold text-base lg:text-lg">
                                {currentChannel.name}
                            </h3>
                            <p className="hidden lg:block text-sm text-muted-foreground">
                                {currentChannel.description}
                            </p>
                        </motion.div>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-primary/20"
                                >
                                    <Radio className="h-4 w-4 lg:h-5 lg:w-5" />
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
                    <AnimatePresence>
                        <motion.div
                            variants={controlsVariants}
                            initial="hidden"
                            animate={isHovered || isMobile ? "visible" : "hidden"}
                            className="overflow-hidden"
                        >
                            <motion.div
                                variants={controlsContentVariants}
                                className="flex flex-col gap-3 lg:gap-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 lg:gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handlePlayPause}
                                            className="hover:bg-primary/20"
                                        >
                                            {isPlaying ? (
                                                <Pause className="h-4 w-4 lg:h-5 lg:w-5" />
                                            ) : (
                                                <Play className="h-4 w-4 lg:h-5 lg:w-5" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleChannelChange(
                                                    CHANNELS[
                                                        (CHANNELS.findIndex(
                                                            (c) =>
                                                                c.id ===
                                                                currentChannel.id
                                                        ) +
                                                            1) %
                                                            CHANNELS.length
                                                    ]
                                                )
                                            }
                                            className="hover:bg-primary/20"
                                        >
                                            <SkipForward className="h-4 w-4 lg:h-5 lg:w-5" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-1 lg:gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handlePictureInPicture}
                                            className="hover:bg-primary/20"
                                        >
                                            <PictureInPicture2 className="h-4 w-4 lg:h-5 lg:w-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleFullscreen}
                                            className="hover:bg-primary/20"
                                        >
                                            {isFullscreen ? (
                                                <Minimize2 className="h-4 w-4 lg:h-5 lg:w-5" />
                                            ) : (
                                                <Maximize2 className="h-4 w-4 lg:h-5 lg:w-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Volume control */}
                                <div className="hidden lg:flex items-center gap-2 lg:gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleVolumeChange(
                                                volume > 0 ? [0] : [50]
                                            )
                                        }
                                        className="hover:bg-primary/20"
                                    >
                                        {volume === 0 ? (
                                            <VolumeX className="h-4 w-4 lg:h-5 lg:w-5" />
                                        ) : (
                                            <Volume2 className="h-4 w-4 lg:h-5 lg:w-5" />
                                        )}
                                    </Button>
                                    <Slider
                                        value={[volume]}
                                        onValueChange={handleVolumeChange}
                                        max={100}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </>
    );
};

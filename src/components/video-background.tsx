"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSoundStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { type BackgroundVideo } from "@/config/background-config";

interface VideoBackgroundProps {
    currentBackground: BackgroundVideo;
}

export const VideoBackground = ({
    currentBackground,
}: VideoBackgroundProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const nextVideoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentVideo, setCurrentVideo] = useState("");
    const { theme, systemTheme } = useTheme();
    const {
        isRaining,
        isCityTraffic,
        isPeopleTalking,
        isWaves,
        isWind,
        isKeyboard,
        volume,
    } = useSoundStore();

    const rainAudioRef = useRef<HTMLAudioElement>(null);
    const cityTrafficRef = useRef<HTMLAudioElement>(null);
    const peopleTalkRef = useRef<HTMLAudioElement>(null);
    const wavesRef = useRef<HTMLAudioElement>(null);
    const windRef = useRef<HTMLAudioElement>(null);
    const keyboardRef = useRef<HTMLAudioElement>(null);

    const getVideoPath = useCallback(
        (hour: number, isRaining: boolean, isDark: boolean) => {
            const isNight = isDark || hour >= 18 || hour < 6;
            const videoType = isNight
                ? isRaining
                    ? "night-rain"
                    : "night"
                : isRaining
                ? "day-rain"
                : "day";

            if (
                isRaining &&
                !currentBackground.videos[
                    `${isNight ? "night" : "day"}-rain` as const
                ]
            ) {
                return `${currentBackground.url}/${
                    currentBackground.videos[isNight ? "night" : "day"]
                }`;
            }

            return `${currentBackground.url}/${
                currentBackground.videos[
                    videoType as keyof typeof currentBackground.videos
                ]
            }`;
        },
        [currentBackground]
    );

    const updateVideo = useCallback(() => {
        const hour = currentTime.getHours();
        const currentTheme = theme === "system" ? systemTheme : theme;
        const isDark = currentTheme === "dark";
        const videoPath = getVideoPath(hour, isRaining, isDark);

        if (currentVideo !== videoPath) {
            setCurrentVideo(videoPath);
        }
    }, [
        currentTime,
        theme,
        systemTheme,
        isRaining,
        getVideoPath,
        currentVideo,
    ]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        updateVideo();
    }, [currentTime, isRaining, theme, systemTheme, updateVideo]);

    useEffect(() => {
        if (!videoRef.current || !nextVideoRef.current || !currentVideo) return;

        const currentVideoEl = videoRef.current;
        const nextVideoEl = nextVideoRef.current;

        nextVideoEl.src = currentVideo;
        nextVideoEl.load();

        const handleNextVideoReady = () => {
            nextVideoEl
                .play()
                .then(() => {
                    nextVideoEl.classList.remove("opacity-0");
                    currentVideoEl.classList.add("opacity-0");

                    setTimeout(() => {
                        currentVideoEl.src = currentVideo;
                        currentVideoEl.load();
                        currentVideoEl.play().then(() => {
                            currentVideoEl.classList.remove("opacity-0");
                            nextVideoEl.classList.add("opacity-0");
                        });
                    }, 500);
                })
                .catch(console.error);
        };

        nextVideoEl.addEventListener("canplay", handleNextVideoReady, {
            once: true,
        });

        return () => {
            nextVideoEl.removeEventListener("canplay", handleNextVideoReady);
        };
    }, [currentVideo]);

    useEffect(() => {
        const audioRefs = [
            { ref: rainAudioRef, isPlaying: isRaining },
            { ref: cityTrafficRef, isPlaying: isCityTraffic },
            { ref: peopleTalkRef, isPlaying: isPeopleTalking },
            { ref: wavesRef, isPlaying: isWaves },
            { ref: windRef, isPlaying: isWind },
            { ref: keyboardRef, isPlaying: isKeyboard },
        ];

        audioRefs.forEach(({ ref, isPlaying }) => {
            if (ref.current) {
                ref.current.volume = volume * 0.5;
                if (isPlaying && ref.current.paused) {
                    ref.current.play().catch(() => {});
                } else if (!isPlaying && !ref.current.paused) {
                    ref.current.pause();
                    ref.current.currentTime = 0;
                }
            }
        });
    }, [
        isRaining,
        isCityTraffic,
        isPeopleTalking,
        isWaves,
        isWind,
        isKeyboard,
        volume,
    ]);

    return (
        <>
            <div className="fixed inset-0 bg-black">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    onLoadStart={() => {
                        if (videoRef.current) {
                            videoRef.current.play().catch((error) => {
                                console.warn(
                                    "Video autoplay was prevented:",
                                    error
                                );
                            });
                        }
                    }}
                />
                <video
                    ref={nextVideoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                    onLoadStart={() => {
                        if (nextVideoRef.current) {
                            nextVideoRef.current.play().catch((error) => {
                                console.warn(
                                    "Video autoplay was prevented:",
                                    error
                                );
                            });
                        }
                    }}
                />
            </div>
            <audio ref={rainAudioRef} loop src="/assets/sounds/rain_city.mp3" />
            <audio
                ref={cityTrafficRef}
                loop
                src="/assets/sounds/city_traffic.mp3"
            />
            <audio
                ref={peopleTalkRef}
                loop
                src="/assets/sounds/people_talk_inside.mp3"
            />
            <audio ref={wavesRef} loop src="/assets/sounds/waves.mp3" />
            <audio ref={windRef} loop src="/assets/sounds/wind.mp3" />
            <audio ref={keyboardRef} loop src="/assets/sounds/keyboard.mp3" />
        </>
    );
};

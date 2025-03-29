"use client";

import { useEffect, useRef, useState } from "react";
import { useSoundStore } from "@/lib/store";

export const VideoBackground = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const nextVideoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentVideo, setCurrentVideo] = useState("");
    const {
        isRaining,
        isCityTraffic,
        isPeopleTalking,
        isWaves,
        isWind,
        volume,
    } = useSoundStore();

    const rainAudioRef = useRef<HTMLAudioElement>(null);
    const cityTrafficRef = useRef<HTMLAudioElement>(null);
    const peopleTalkRef = useRef<HTMLAudioElement>(null);
    const wavesRef = useRef<HTMLAudioElement>(null);
    const windRef = useRef<HTMLAudioElement>(null);

    const getVideoPath = (hour: number, isRaining: boolean) => {
        const isNight = hour >= 18 || hour < 6;
        return isNight
            ? isRaining
                ? "/assets/videos/ExteriorRainyNight.mp4"
                : "/assets/videos/ExteriorNight.mp4"
            : isRaining
            ? "/assets/videos/ExteriorRainyDay.mp4"
            : "/assets/videos/ExteriorDay.mp4";
    };

    const updateVideo = () => {
        const hour = currentTime.getHours();
        const videoPath = getVideoPath(hour, isRaining);

        if (currentVideo !== videoPath) {
            setCurrentVideo(videoPath);
        }
    };

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Update video path when time or rain state changes
    useEffect(() => {
        updateVideo();
    }, [currentTime, isRaining]);

    // Handle video source changes
    useEffect(() => {
        if (!videoRef.current || !nextVideoRef.current || !currentVideo) return;

        const currentVideoEl = videoRef.current;
        const nextVideoEl = nextVideoRef.current;

        // Prepare next video
        nextVideoEl.src = currentVideo;
        nextVideoEl.load();

        const handleNextVideoReady = () => {
            // Start playing next video
            nextVideoEl
                .play()
                .then(() => {
                    // Once next video is playing, fade it in
                    nextVideoEl.classList.remove("opacity-0");
                    currentVideoEl.classList.add("opacity-0");

                    // After transition, update current video
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

    // Handle audio
    useEffect(() => {
        const audioRefs = [
            { ref: rainAudioRef, isPlaying: isRaining },
            { ref: cityTrafficRef, isPlaying: isCityTraffic },
            { ref: peopleTalkRef, isPlaying: isPeopleTalking },
            { ref: wavesRef, isPlaying: isWaves },
            { ref: windRef, isPlaying: isWind },
        ];

        audioRefs.forEach(({ ref, isPlaying }) => {
            if (ref.current) {
                ref.current.volume = volume * 0.5;
                if (isPlaying && ref.current.paused) {
                    ref.current.play().catch(() => {
                        // Ignore play errors - they can happen when the user hasn't interacted with the page yet
                    });
                } else if (!isPlaying && !ref.current.paused) {
                    ref.current.pause();
                    ref.current.currentTime = 0;
                }
            }
        });
    }, [isRaining, isCityTraffic, isPeopleTalking, isWaves, isWind, volume]);

    return (
        <>
            <div className="fixed inset-0 bg-black">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                />
                <video
                    ref={nextVideoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
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
        </>
    );
};

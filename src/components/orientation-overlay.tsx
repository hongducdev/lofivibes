"use client";

import { useEffect, useState } from "react";

const OrientationOverlay = () => {
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            if (window.innerWidth <= 768) {
                setIsPortrait(window.innerHeight > window.innerWidth);
            } else {
                setIsPortrait(false);
            }
        };

        checkOrientation();

        window.addEventListener("resize", checkOrientation);
        window.addEventListener("orientationchange", checkOrientation);

        return () => {
            window.removeEventListener("resize", checkOrientation);
            window.removeEventListener("orientationchange", checkOrientation);
        };
    }, []);

    if (!isPortrait) return null;

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="max-w-xs w-full text-center p-6 space-y-4">
                <div className="flex justify-center mb-6">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="64" 
                        height="64" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="text-primary animate-bounce"
                    >
                        <path d="M17 2.1l4 4-4 4"/>
                        <path d="M3 12.2v-2"/>
                        <path d="M7 12.2v-2"/>
                        <path d="M11 12.2v-2"/>
                        <path d="M15 12.2v-2"/>
                        <path d="M19 12.2v-2"/>
                        <path d="M3 19.2v-2"/>
                        <path d="M7 19.2v-2"/>
                        <path d="M11 19.2v-2"/>
                        <path d="M15 19.2v-2"/>
                        <path d="M19 19.2v-2"/>
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                    Please Rotate Your Device
                </h2>
                <p className="text-muted-foreground">
                    This app is best viewed in landscape mode. Please rotate your device for the optimal experience.
                </p>
            </div>
        </div>
    );
};

export default OrientationOverlay;

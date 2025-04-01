"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const NetworkStatus = () => {
    useEffect(() => {
        const handleOnline = () => {
            toast.success("Internet Connection Restored", {
                description: "You can now use all online features",
                duration: 3000
            });
        };

        const handleOffline = () => {
            toast.error("No Internet Connection", {
                description: "Please check your internet connection",
                duration: Infinity
            });
        };

        if (!navigator.onLine) {
            handleOffline();
        }

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return null;
};

export default NetworkStatus;

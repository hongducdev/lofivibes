"use client";

import { useEffect, useState } from "react";
import NumberFlow, { type Value } from "@number-flow/react";

const Time = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return (
        <div className="px-6 py-4 rounded-2xl bg-background/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-3 text-5xl font-mono tracking-tight">
                <div className="flex">
                    {displayHours
                        .toString()
                        .split("")
                        .map((digit, i) => (
                            <NumberFlow
                                key={`hour-${i}`}
                                value={parseInt(digit) as Value}
                                trend={0}
                                format={{ notation: "compact" }}
                                className="w-10 text-center font-bold text-zinc-900 dark:text-zinc-100"
                            />
                        ))}
                </div>
                <span className="text-primary/60 dark:text-primary/40 animate-pulse">
                    :
                </span>
                <div className="flex">
                    {minutes.split("").map((digit, i) => (
                        <NumberFlow
                            key={`min-${i}`}
                            value={parseInt(digit) as Value}
                            trend={0}
                            format={{ notation: "compact" }}
                            className="w-10 text-center font-bold text-zinc-900 dark:text-zinc-100"
                        />
                    ))}
                </div>
                <span className="text-zinc-900 dark:text-zinc-100 text-2xl ml-2 font-bold">
                    {ampm}
                </span>
            </div>
        </div>
    );
};

export default Time;

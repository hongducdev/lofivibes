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

    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const seconds = time.getSeconds().toString().padStart(2, "0");

    return (
        <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 text-4xl font-mono tracking-tight">
                <div className="flex">
                    {hours.split("").map((digit, i) => (
                        <NumberFlow
                            key={`hour-${i}`}
                            value={parseInt(digit) as Value}
                            trend={0}
                            format={{ notation: "compact" }}
                            className="w-8 text-center font-bold text-zinc-900 dark:text-zinc-100"
                        />
                    ))}
                </div>
                <span className="text-zinc-400 dark:text-zinc-500 animate-pulse">
                    :
                </span>
                <div className="flex">
                    {minutes.split("").map((digit, i) => (
                        <NumberFlow
                            key={`min-${i}`}
                            value={parseInt(digit) as Value}
                            trend={0}
                            format={{ notation: "compact" }}
                            className="w-8 text-center font-bold text-zinc-900 dark:text-zinc-100"
                        />
                    ))}
                </div>
                <span className="text-zinc-400 dark:text-zinc-500 animate-pulse">
                    :
                </span>
                <div className="flex">
                    {seconds.split("").map((digit, i) => (
                        <NumberFlow
                            key={`sec-${i}`}
                            value={parseInt(digit) as Value}
                            trend={0}
                            format={{ notation: "compact" }}
                            className="w-8 text-center font-bold text-zinc-900 dark:text-zinc-100"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Time;

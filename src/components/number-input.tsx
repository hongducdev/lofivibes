"use client";

import { Button } from "@/components/ui/button";
import NumberFlow, { type Value } from "@number-flow/react";
import { RiAddLine, RiSubtractLine } from "react-icons/ri";

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

const NumberInput = ({
    value,
    onChange,
    min = 1,
    max = 60,
    step = 1,
}: NumberInputProps) => {
    const handleIncrement = () => {
        if (value + step <= max) {
            onChange(value + step);
        }
    };

    const handleDecrement = () => {
        if (value - step >= min) {
            onChange(value - step);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={value <= min}
                className="h-9 w-9"
            >
                <RiSubtractLine className="h-4 w-4" />
            </Button>
            <div className="w-16 h-9 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-md">
                <NumberFlow
                    value={value as Value}
                    trend={0}
                    format={{ notation: "compact" }}
                    className="font-mono font-medium text-zinc-900 dark:text-zinc-100"
                />
            </div>
            <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={value >= max}
                className="h-9 w-9"
            >
                <RiAddLine className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default NumberInput;

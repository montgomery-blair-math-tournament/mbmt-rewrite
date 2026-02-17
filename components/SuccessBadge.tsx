import { cn } from "@/lib/utils";
import React from "react";
import { HiCheck, HiXMark } from "react-icons/hi2";

export default function SuccessBadge({
    success,
    successText,
    failText,
    className,
    ...props
}: {
    success: boolean;
    successText: string;
    failText: string;
} & React.ComponentProps<"button">) {
    return (
        <button
            className={cn(
                {
                    "bg-green-200 text-green-800 border-green-500 border text-xs px-2.5 py-1 rounded flex items-center gap-1 hover:bg-green-300/90 hover:cursor-pointer transition-colors":
                        success,
                    "bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded flex items-center gap-1 hover:bg-gray-300 hover:cursor-pointer transition-colors":
                        !success,
                },
                className
            )}
            {...props}>
            {success ? (
                <>
                    <HiCheck className="w-3 h-3" /> {successText}
                </>
            ) : (
                <>
                    <HiXMark className="w-3 h-3" /> {failText}
                </>
            )}
        </button>
    );
}

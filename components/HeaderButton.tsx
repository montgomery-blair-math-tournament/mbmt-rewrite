import { cn } from "@/lib/utils";
import React from "react";

export default function HeaderButton({
    className,
    variant = "primary",
    ...props
}: { variant?: "primary" | "secondary" } & React.ComponentProps<"button">) {
    return (
        <button
            className={cn(
                {
                    "bg-rose-800 text-white hover:bg-rose-700/90":
                        variant === "primary",
                    "dark:bg-gray-100 bg-gray-800 text-gray-100 dark:text-gray-800 dark:hover:bg-gray-200/80 hover:bg-gray-700/80":
                        variant === "secondary",
                },
                "px-4 py-2.25 rounded-md transition-colors text-sm  hover:cursor-pointer inline-flex gap-2 leading-4",
                className
            )}
            {...props}
        />
    );
}

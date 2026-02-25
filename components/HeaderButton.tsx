import { cn } from "@/lib/utils";
import React from "react";

export default function HeaderButton({
    className,
    disabled,
    variant = "primary",
    ...props
}: { variant?: "primary" | "secondary" } & React.ComponentProps<"button">) {
    return (
        <button
            className={cn(
                {
                    "bg-rose-800 text-white": variant === "primary",
                    "dark:bg-gray-100 bg-gray-800 text-gray-100 dark:text-gray-800":
                        variant === "secondary",
                    "hover:bg-rose-700/90": variant === "primary" && !disabled,
                    "dark:hover:bg-gray-200/80 hover:bg-gray-700/80":
                        variant === "secondary" && !disabled,
                    "opacity-50 select-none": disabled,
                    "hover:cursor-pointer": !disabled,
                },
                "px-4 py-2.25 rounded-md transition-colors text-sm inline-flex gap-2 leading-4",
                className
            )}
            tabIndex={disabled ? -1 : props.tabIndex}
            {...props}
        />
    );
}

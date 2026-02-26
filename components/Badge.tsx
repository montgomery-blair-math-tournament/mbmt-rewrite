import { cn } from "@/lib/utils";
import React from "react";

export default function Badge({
    variant,
    className,
    onClick,
    ...props
}: {
    variant: "success" | "failure" | "primary" | "secondary";
} & React.ComponentProps<"button">) {
    return (
        <button
            className={cn(
                {
                    "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border-green-300 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-700":
                        variant === "success",
                    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700":
                        variant === "secondary",
                    "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 border-red-300 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-700":
                        variant === "failure",
                    "bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800 border-gray-600 dark:border-gray-300 hover:bg-gray-700 dark:hover:bg-gray-200":
                        variant === "primary",
                },
                { "hover:cursor-pointer": onClick },
                "text-xs font-medium px-3 py-1 rounded border flex items-center gap-1 transition-colors",
                className
            )}
            onClick={onClick}
            {...props}
        />
    );
}

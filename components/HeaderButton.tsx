import { cn } from "@/lib/utils";
import React from "react";

export default function HeaderButton({
    className,
    ...props
}: React.ComponentProps<"button">) {
    return (
        <button
            className={cn(
                "bg-rose-800 text-white px-4 py-2 rounded-md transition-colors text-sm hover:bg-rose-700 hover:cursor-pointer",
                className
            )}
            {...props}
        />
    );
}

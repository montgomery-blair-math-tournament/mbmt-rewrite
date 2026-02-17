import { cn } from "@/lib/utils";
import React from "react";
import { HiX } from "react-icons/hi";

export default function HeaderButton({
    className,
    ...props
}: React.ComponentProps<"button">) {
    return (
        <button
            className={cn(
                "bg-rose-800 text-white px-4 py-2.25 rounded-md transition-colors text-sm hover:bg-rose-700/90 hover:cursor-pointer inline-flex gap-2 leading-4",
                className
            )}
            {...props}
        />
    );
}

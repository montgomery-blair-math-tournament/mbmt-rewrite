import { cn } from "@/lib/utils";
import React from "react";

export default function HeaderButton({
    className,
    disabled = false,
    ...props
}: React.ComponentProps<"button">) {
    return (
        <button
            className={cn(
                {
                    "opacity-70 select-none -z-50": disabled,
                    "hover:bg-accent-hover hover:cursor-pointer": !disabled,
                },
                "bg-accent text-white px-4 py-2.5 rounded-md transition-colors text-sm inline-flex gap-2 leading-4",
                className
            )}
            {...props}
        />
    );
}

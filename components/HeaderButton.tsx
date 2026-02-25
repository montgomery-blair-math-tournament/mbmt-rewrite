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
                    "hover:bg-rose-700 hover:cursor-pointer": !disabled,
                },
                "bg-rose-800 text-white px-4 py-2.5 rounded-md transition-colors text-sm inline-flex gap-2 leading-4",
                className
            )}
            {...props}
        />
    );
}

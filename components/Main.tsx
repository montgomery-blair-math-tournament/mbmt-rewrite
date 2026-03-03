import { cn } from "@/lib/utils";
import React from "react";

export default function Main({
    className,
    ...props
}: { className?: string } & React.ComponentProps<"div">) {
    return (
        <main
            className={cn(
                "flex flex-col gap-4 flex-1 w-full md:max-w-5/6 p-8 md:mx-auto",
                className
            )}
            {...props}
        />
    );
}

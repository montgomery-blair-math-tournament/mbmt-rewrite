import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export default function Link2({
    className,
    href,
    ...props
}: React.ComponentProps<typeof Link>) {
    return (
        <Link
            className={cn("text-link hover:underline", className)}
            href={href}
            {...props}
        />
    );
}

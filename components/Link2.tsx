import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export default function Link2({
    className,
    href,
    children,
    ...params
}: React.ComponentProps<typeof Link>) {
    return (
        <Link
            className={cn(
                className,
                "dark:text-blue-400 text-[#2969a1] hover:underline"
            )}
            href={href}
            {...params}>
            {children}
        </Link>
    );
}

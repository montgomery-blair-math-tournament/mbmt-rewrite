import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export default function Link2({
    className,
    href,
    children,
    ...props
}: React.ComponentProps<typeof Link>) {
    return (
        <Link
            className={cn(
                "dark:text-blue-400 text-[#2969a1] hover:underline",
                className
            )}
            href={href}
            {...props}>
            {children}
        </Link>
    );
}

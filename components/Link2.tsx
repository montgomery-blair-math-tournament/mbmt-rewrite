import Link from "next/link";
import React from "react";

export default function Link2({
    href,
    children,
}: {
    href: string;
    children?: React.ReactNode;
}) {
    return (
        <Link
            className="dark:text-blue-400 text-[#2969a1] hover:underline"
            href={href}>
            {children}
        </Link>
    );
}

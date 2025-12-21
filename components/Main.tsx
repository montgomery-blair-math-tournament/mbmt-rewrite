import clsx from "clsx";
import React from "react";

export default function Main({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={clsx(
                "flex flex-col gap-4 flex-1 max-w-5/6 md:max-w-3/4 mx-auto",
                className
            )}>
            {children}
        </div>
    );
}

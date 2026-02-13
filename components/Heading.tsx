import React from "react";

export default function Heading({
    level,
    children,
}: {
    level: 1 | 2 | 3;
    children?: React.ReactNode;
}) {
    if (level == 3) {
        return <h3 className="text-xl mt-1 font-bold font-sans">{children}</h3>;
    } else if (level == 2) {
        return (
            <h2 className="text-2xl mt-2 font-bold font-sans">{children}</h2>
        );
    } else {
        return (
            <h1 className="text-4xl mt-4 mb-2 font-bold font-sans">
                {children}
            </h1>
        );
    }
}

import React from "react";

export default function Centered({ children }: { children: React.ReactNode }) {
    return <div className="max-w-2/3 ml-auto mr-auto">{children}</div>;
}

import "katex/dist/katex.min.css";
import React from "react";
import Latex from "react-latex-next";

export default function Math({ eq, raw }: { eq: string; raw?: boolean }) {
    return <Latex>{raw ? eq : `$${eq}$`}</Latex>;
}

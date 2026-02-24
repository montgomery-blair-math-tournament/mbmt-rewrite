import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

export default function Math({
    eq,
    raw = true,
}: {
    eq: string;
    raw?: boolean;
}) {
    return <Latex>{raw ? eq : `$${eq}$`}</Latex>;
}

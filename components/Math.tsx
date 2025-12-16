import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

export default function Math({ eq }: { eq: string }) {
    return <Latex>{`$${eq}$`}</Latex>;
}

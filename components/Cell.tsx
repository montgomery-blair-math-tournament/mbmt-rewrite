import { cn } from "@/lib/utils";

export default function Cell({
    side,
    className,
    rowspan,
    colspan,
    children,
}: {
    side?: "left" | "right";
    className?: string;
    rowspan?: number;
    colspan?: number;
    children?: string | React.ReactNode;
}) {
    return (
        <td
            className={cn(
                className,
                "p-2 align-top",
                side == "left" && "border-r text-right",
                side == "right" && "border-l text-left"
            )}
            rowSpan={rowspan}
            colSpan={colspan}>
            {children}
        </td>
    );
}

import clsx from "clsx";

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
            className={clsx(
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

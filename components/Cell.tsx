import clsx from "clsx";

export default function Cell({
    side,
    children,
}: {
    side?: "left" | "right";
    children: string;
}) {
    return (
        <td
            className={clsx(
                "px-2",
                side == "left" && "border-r text-right",
                side == "right" && "border-l text-left"
            )}>
            {children}
        </td>
    );
}

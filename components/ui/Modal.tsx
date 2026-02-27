"use client";

import { HiXMark } from "react-icons/hi2";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    className = "w-2/3 h-2/3",
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div
                className={cn(
                    "bg-gray-100 rounded-xl shadow-xl flex flex-col",
                    className
                )}>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors hover:cursor-pointer"
                            aria-label="Close">
                            <HiXMark className="w-6 h-6 text-gray-600 " />
                        </button>
                        <h2 className="text-xl font-semibold h-full">
                            {title}
                        </h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">{children}</div>

                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t rounded-b-lg">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ModalButton({
    variant,
    className,
    ...props
}: {
    variant: "primary" | "secondary" | "themed";
} & React.ComponentProps<"button">) {
    return (
        <button
            className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent hover:cursor-pointer",
                {
                    "text-white bg-accent hover:bg-accent-hover":
                        variant === "themed",
                    "text-gray-700 bg-gray-200 hover:bg-gray-300":
                        variant === "primary",
                    "text-gray-200 bg-gray-800 hover:bg-gray-700":
                        variant === "secondary",
                },
                className
            )}
            {...props}
        />
    );
}

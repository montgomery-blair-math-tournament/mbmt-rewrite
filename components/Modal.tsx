"use client";

import { HiXMark } from "react-icons/hi2";
import { ReactNode } from "react";
import Button from "@/components/ui/Button";

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
    className = "w-11/12 h-5/6",
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
                className={`bg-white rounded-lg shadow-xl flex flex-col ${className}`}>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full"
                            aria-label="Close">
                            <HiXMark className="w-6 h-6 text-gray-500" />
                        </Button>
                        <h2 className="text-xl font-semibold">{title}</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {children}
                </div>

                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

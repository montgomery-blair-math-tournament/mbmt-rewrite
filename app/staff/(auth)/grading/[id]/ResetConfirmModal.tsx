"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/ui/Button";
import { resetGrades } from "@/app/actions/grading";
import { toast } from "sonner";

export default function ResetConfirmModal({
    isOpen,
    onClose,
    id,
    participantName,
    roundId,
    type,
}: {
    isOpen: boolean;
    onClose: () => void;
    id: number;
    participantName: string;
    roundId: number;
    type: "participant" | "team";
}) {
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        setLoading(true);
        const res = await resetGrades(id, roundId, type);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success(`Grades for ${participantName} have been reset`);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reset Grades"
            className="w-full max-w-md h-auto"
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-red-800 hover:bg-red-700 text-white"
                        onClick={handleReset}
                        disabled={loading}>
                        {loading ? "Resetting..." : "Reset"}
                    </Button>
                </>
            }>
            <div className="py-2">
                <p className="text-gray-700">
                    Are you sure you want to reset the grades and scores for{" "}
                    <strong>{participantName}</strong>?
                </p>
                <p className="text-sm text-red-600 mt-2">
                    This action cannot be undone. All previous grading attempts
                    for this round will be permanently deleted.
                </p>
            </div>
        </Modal>
    );
}

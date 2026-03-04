"use client";

import Modal from "@/components/Modal";
import Button from "@/components/ui/Button";

export default function ConflictConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    conflicts,
    problems,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    conflicts: { problem_id: number }[];
    problems: { id: number; number: string | number }[];
}) {
    const conflictingProblems = conflicts
        .map((c) => {
            const p = problems.find((problem) => problem.id === c.problem_id);
            return p ? `Problem ${p.number}` : `Problem ID ${c.problem_id}`;
        })
        .join(", ");

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Conflict Detected"
            className="w-full max-w-md">
            <div className="flex flex-col gap-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    <p className="font-medium">Conflicting Grades Found</p>
                    <p className="text-sm mt-1">
                        The following problems have been graded differently by
                        other graders:
                    </p>
                    <p className="font-semibold mt-2">{conflictingProblems}</p>
                </div>

                <p className="text-gray-600 text-sm">
                    You can either review your grades or confirm your submission
                    as is.
                </p>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Review
                    </Button>
                    <Button onClick={onConfirm}>Confirm Submit</Button>
                </div>
            </div>
        </Modal>
    );
}

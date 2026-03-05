"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { addParticipantOrTeamToRound } from "./grading";

interface AddToRoundModalProps {
    isOpen: boolean;
    onClose: () => void;
    fullId: string;
    roundId: number;
    type: "participant" | "team";
    onSuccess?: () => void;
}

export default function AddToRoundModal({
    isOpen,
    onClose,
    fullId,
    roundId,
    type,
    onSuccess,
}: AddToRoundModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        const res = await addParticipantOrTeamToRound(fullId, roundId, type);
        setIsSubmitting(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Added ${fullId.toUpperCase()} to round`);
            onSuccess?.();
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Add ${type === "team" ? "Team" : "Participant"} to Round`}>
            <div className="flex flex-col gap-4">
                <p>
                    Are you sure you want to add{" "}
                    <strong>{fullId.toUpperCase()}</strong> to this round?
                </p>
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add to Round"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

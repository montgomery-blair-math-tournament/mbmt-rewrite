"use client";

import Modal from "@/components/Modal";
import GradingForm from "./GradingForm";
import { Problem } from "@/lib/schema/problem";

export default function GradingModal({
    isOpen,
    onClose,
    type,
    id,
    roundId,
    problems,
    participantName,
}: {
    isOpen: boolean;
    onClose: () => void;
    type: "participant" | "team";
    id: number;
    roundId: number;
    problems: Problem[];
    participantName: string;
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Grading: ${participantName} (${type === "participant" ? "ID: " : "Team ID: "}${id})`}
            className="w-11/12 md:w-2/3 h-5/6">
            <GradingForm
                type={type}
                id={id}
                roundId={roundId}
                problems={problems}
                onSuccess={onClose}
            />
        </Modal>
    );
}

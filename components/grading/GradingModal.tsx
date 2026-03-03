"use client";

import Modal from "@/components/Modal";
import GradingForm from "./GradingForm";
import { Problem } from "@/lib/schema/problem";

type GradingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    type: "participant" | "team";
    id: number;
    displayId: string;
    roundId: number;
    problems: Problem[];
    targetName: string;
};

export default function GradingModal({
    isOpen,
    onClose,
    type,
    id,
    displayId,
    roundId,
    problems,
    targetName,
}: GradingModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Grading: ${targetName} (${type === "participant" ? "ID: " : "Team ID: "}${displayId})`}
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

"use client";

import Modal from "@/components/Modal";
import GradingForm from "./GradingForm";
import { Problem } from "@/lib/schema/problem";
import GutsGradingForm from "./GutsGradingForm";

export default function GradingModal({
    isOpen,
    onClose,
    type,
    id,
    displayId,
    roundId,
    problems,
    targetName,
    gutsParsedProblems: gutsProblems,
    isGuts = false,
}: {
    isOpen: boolean;
    onClose: () => void;
    type: "participant" | "team";
    id: number;
    displayId: string;
    roundId: number;
    problems: Problem[];
    targetName: string;
    gutsParsedProblems: (Omit<Problem, "guts_section"> & {
        guts_section: number;
    })[];
    isGuts: boolean;
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Grading: ${targetName} (${type === "participant" ? "ID: " : "Team ID: "}${displayId})`}
            className="w-11/12 md:w-2/3 h-5/6">
            {!isGuts && (
                <GradingForm
                    type={type}
                    id={id}
                    roundId={roundId}
                    problems={problems}
                    onSuccess={onClose}
                />
            )}
            {isGuts && (
                <GutsGradingForm
                    roundId={roundId}
                    problems={gutsProblems}
                    onSuccess={onClose}
                />
            )}
        </Modal>
    );
}

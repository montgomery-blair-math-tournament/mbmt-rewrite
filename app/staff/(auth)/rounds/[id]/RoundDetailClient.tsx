"use client";

import Heading from "@/components/Heading";
import Link from "next/link";
import { Problem } from "@/lib/schema/problem";
import { Round } from "@/lib/schema/round";
import ProblemCard from "@/components/ProblemCard";
import { DIVISIONS } from "@/lib/constants/settings";
import { HiPencil, HiPlus } from "react-icons/hi2";
import { useState } from "react";
import EditRoundModal from "@/components/EditRoundModal";
import ProblemModal from "@/components/ProblemModal";
import Modal from "@/components/Modal";
import Button from "@/components/ui/Button";

import { Stats } from "@/lib/schema/stats";
import { deleteProblem } from "./actions";
import { deleteRound } from "../actions";
import { toast } from "sonner";
import Badge from "@/components/Badge";

export default function RoundDetailClient({
    round,
    problems,
    stats,
}: {
    round: Round;
    problems: Problem[];
    stats: Stats;
}) {
    const [isEditRoundOpen, setIsEditRoundOpen] = useState(false);
    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(
        null
    );
    const [problemToDelete, setProblemToDelete] = useState<Problem | null>(
        null
    );
    const [isDeleteRoundOpen, setIsDeleteRoundOpen] = useState(false);

    const handleEditProblem = (problem: Problem) => {
        setSelectedProblem(problem);
        setIsProblemModalOpen(true);
    };

    const handleAddProblem = () => {
        setSelectedProblem(null);
        setIsProblemModalOpen(true);
    };

    const handleCloseProblemModal = () => {
        setIsProblemModalOpen(false);
        setSelectedProblem(null);
    };

    const handleDeleteClick = (problem: Problem) => {
        setProblemToDelete(problem);
    };

    const handleConfirmDelete = async () => {
        if (!problemToDelete) return;

        try {
            await deleteProblem(problemToDelete.id, round.id);
            toast.success("Problem deleted");
            setProblemToDelete(null);
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete problem");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <div className="mb-2">
                    <Link
                        href="/staff/rounds"
                        className="text-sm text-gray-500 hover:underline">
                        ← Back to Rounds
                    </Link>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Heading level={1}>{round.name}</Heading>
                        <Badge variant="secondary">
                            {DIVISIONS[round.division]?.name ||
                                "Unknown Division"}
                        </Badge>
                        <Badge variant="failure">
                            {round.type.charAt(0).toUpperCase() +
                                round.type.substring(1)}{" "}
                            Round
                        </Badge>
                        <span className="text-gray-500 text-sm">
                            Progress: {stats.graded} / {stats.total}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditRoundOpen(true)}
                            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm">
                            <HiPencil className="mr-2 h-4 w-4" />
                            Edit Round
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteRoundOpen(true)}
                            className="bg-white hover:bg-red-50 text-red-700 border-gray-300 shadow-sm hover:text-red-800">
                            Delete Round
                        </Button>
                        <Button
                            onClick={handleAddProblem}
                            className="bg-accent hover:bg-accent-hover text-white shadow-sm">
                            <HiPlus className="mr-2 h-4 w-4" />
                            Add Problem
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <Heading level={2}>Problems</Heading>
                <div className="grid grid-cols-1 gap-4">
                    {problems.map((problem) => (
                        <ProblemCard
                            key={problem.id}
                            problem={problem}
                            onEdit={handleEditProblem}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            </div>

            <EditRoundModal
                round={round}
                isOpen={isEditRoundOpen}
                onClose={() => setIsEditRoundOpen(false)}
            />

            <ProblemModal
                roundId={round.id}
                problem={selectedProblem}
                isOpen={isProblemModalOpen}
                onClose={handleCloseProblemModal}
            />

            <Modal
                isOpen={!!problemToDelete}
                onClose={() => setProblemToDelete(null)}
                title="Delete Problem"
                className="w-full max-w-md h-auto"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setProblemToDelete(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </Button>
                    </>
                }>
                <div className="text-sm text-gray-500">
                    Are you sure you want to delete Problem{" "}
                    {problemToDelete?.number}? This action cannot be undone.
                </div>
            </Modal>

            <Modal
                isOpen={isDeleteRoundOpen}
                onClose={() => setIsDeleteRoundOpen(false)}
                title="Delete Round"
                className="w-full max-w-md h-auto"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteRoundOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                try {
                                    await deleteRound(round.id);
                                    toast.success("Round deleted");
                                } catch (e) {
                                    console.error(e);
                                    toast.error("Failed to delete round");
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </Button>
                    </>
                }>
                <div className="text-sm text-gray-500">
                    Are you sure you want to delete round <b>{round.name}</b>?
                    This action cannot be undone and will delete all problems
                    associated with it.
                </div>
            </Modal>
        </div>
    );
}

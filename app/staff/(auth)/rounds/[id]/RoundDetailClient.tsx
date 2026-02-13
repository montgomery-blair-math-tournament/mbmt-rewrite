"use client";

import Heading from "@/components/Heading";
import Link from "next/link";
import { Problem } from "@/lib/schema/problem";
import { Round } from "@/lib/schema/round";
import ProblemCard from "@/components/ProblemCard";
import { DIVISIONS } from "@/lib/settings";
import { HiPencil, HiPlus } from "react-icons/hi2";
import { useState } from "react";
import EditRoundModal from "@/components/EditRoundModal";
import ProblemModal from "@/components/ProblemModal";
import Modal from "@/components/Modal";

import { Stats } from "@/lib/schema/stats";
import { deleteProblem } from "./actions";
import { toast } from "sonner";

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
    const [selectedProblem, setSelectedProblem] = useState<Problem | undefined>(
        undefined
    );
    const [problemToDelete, setProblemToDelete] = useState<Problem | null>(
        null
    );

    const handleEditProblem = (problem: Problem) => {
        setSelectedProblem(problem);
        setIsProblemModalOpen(true);
    };

    const handleAddProblem = () => {
        setSelectedProblem(undefined);
        setIsProblemModalOpen(true);
    };

    const handleCloseProblemModal = () => {
        setIsProblemModalOpen(false);
        setSelectedProblem(undefined);
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
        <div className="space-y-6">
            <div>
                <div className="mb-2">
                    <Link
                        href="/staff/rounds"
                        className="text-sm text-gray-500 hover:underline">
                        ← Back to Rounds
                    </Link>
                </div>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Heading level={1}>{round.name}</Heading>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 border border-gray-500">
                            {DIVISIONS[round.division]?.name ||
                                "Unknown Division"}
                        </span>
                        <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-rose-900 dark:text-rose-300 border border-rose-500 capitalize">
                            {round.type} Round
                        </span>
                        <span className="text-gray-500 text-sm">
                            Progress: {stats.graded} / {stats.total}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditRoundOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                            <HiPencil className="mr-2 h-4 w-4" />
                            Edit Round
                        </button>
                        <button
                            onClick={handleAddProblem}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                            <HiPlus className="mr-2 h-4 w-4" />
                            Add Problem
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
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
                        <button
                            onClick={() => setProblemToDelete(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer">
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:cursor-pointer">
                            Delete
                        </button>
                    </>
                }>
                <div className="text-sm text-gray-500">
                    Are you sure you want to delete Problem{" "}
                    {problemToDelete?.number}? This action cannot be undone.
                </div>
            </Modal>
        </div>
    );
}

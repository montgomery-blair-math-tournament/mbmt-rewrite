"use client";

import { useEffect, useState } from "react";
import { getAllGrades } from "@/app/actions/grading-data";
import { submitGrades } from "@/app/actions/grading";
import { Problem } from "@/lib/schema/problem";
import Modal from "@/components/Modal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { toast } from "sonner";

import { Switch } from "@/components/ui/Switch";

type ConflictProps = {
    isOpen: boolean;
    onClose: () => void;
    type: "participant" | "team";
    id: number;
    roundId: number;
    problems: Problem[];
    onResolve?: (status?: string, score?: number) => void;
};

type GradeOption = {
    graderName: string;
    graderRole?: string;
    answer: string | null;
    isCorrect: boolean | null;
    id: number;
};

export default function ConflictResolutionModal({
    isOpen,
    onClose,
    type,
    id,
    roundId,
    problems,
    onResolve,
}: ConflictProps) {
    const [conflicts, setConflicts] = useState<Record<number, GradeOption[]>>(
        {}
    );
    const [loading, setLoading] = useState(false);
    const [resolutions, setResolutions] = useState<
        Record<
            number,
            {
                choice: string;
                customAnswer: string;
                customIsCorrect: boolean | null;
            }
        >
    >({});

    useEffect(() => {
        if (isOpen && id) {
            fetchConflicts();
        } else {
            // Reset state when closed
            setConflicts({});
            setResolutions({});
        }
    }, [isOpen, id]);

    const fetchConflicts = async () => {
        setLoading(true);
        try {
            const allGrades = await getAllGrades(type, id, roundId);
            const grouped: Record<number, any[]> = {};
            allGrades.forEach((g: any) => {
                if (!grouped[g.problem_id]) grouped[g.problem_id] = [];
                grouped[g.problem_id].push(g);
            });

            const conflictMap: Record<number, GradeOption[]> = {};

            problems.forEach((p) => {
                const grades = grouped[p.id] || [];

                const hasForce = grades.some((g) => g.is_force);
                if (hasForce) return;

                if (grades.length < 2 && p.type !== "custom") return;

                const first = grades[0];
                const mismatch = grades.some(
                    (g) =>
                        g.is_correct !== first.is_correct ||
                        g.answer !== first.answer
                );

                if (mismatch && grades.length > 1) {
                    conflictMap[p.id] = grades.map((g: any) => ({
                        graderName: g.grader?.username || "Unknown",
                        graderRole: g.grader?.role,
                        answer: g.answer,
                        isCorrect: g.is_correct,
                        id: g.id,
                    }));
                }
            });
            setConflicts(conflictMap);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch conflicts");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (problemId: number) => {
        const res = resolutions[problemId];
        if (!res) return;

        let finalAnswer = null;
        let finalIsCorrect = null;

        if (res.choice === "new") {
            finalAnswer = res.customAnswer;
            finalIsCorrect = res.customIsCorrect;
        } else {
            const options = conflicts[problemId];
            const selected = options.find(
                (o) => o.id.toString() === res.choice
            );
            if (selected) {
                finalAnswer = selected.answer;
                finalIsCorrect = selected.isCorrect;
            }
        }

        const result = await submitGrades([
            {
                type,
                id,
                roundId,
                problemId,
                answer: finalAnswer,
                isCorrect: finalIsCorrect,
                isForce: true,
            },
        ]);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Resolved");

            // Remove the resolved conflict from the UI efficiently
            setConflicts((prev) => {
                const next = { ...prev };
                delete next[problemId];
                return next;
            });

            // If it was the last one, close the modal
            if (Object.keys(conflicts).length <= 1) {
                onClose();
            }

            if (onResolve) {
                onResolve(result.status, result.score);
            }
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Resolve Conflicts"
            className="w-11/12 md:w-2/3 h-5/6">
            {loading ? (
                <div>Loading...</div>
            ) : Object.keys(conflicts).length === 0 ? (
                <div className="text-center py-8">No conflicts found.</div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(conflicts).map(([pId, options]) => {
                        const problemId = parseInt(pId);
                        const problem = problems.find(
                            (p) => p.id === problemId
                        );
                        const res = resolutions[problemId] || {
                            choice: "",
                            customAnswer: "",
                            customIsCorrect: null,
                        };
                        const isStandard =
                            problem?.type === "standard" ||
                            problem?.type === "boolean";

                        return (
                            <div
                                key={problemId}
                                className="border p-4 rounded-lg bg-white">
                                <h3 className="font-semibold mb-2">
                                    Problem {problem?.number}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    {problem?.problem}
                                </p>

                                <RadioGroup
                                    value={res.choice}
                                    onValueChange={(val) =>
                                        setResolutions((prev) => ({
                                            ...prev,
                                            [problemId]: {
                                                ...prev[problemId],
                                                choice: val,
                                            },
                                        }))
                                    }
                                    className="space-y-3">
                                    {options.map((opt, idx) => (
                                        <div
                                            key={opt.id}
                                            className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value={opt.id.toString()}
                                                id={`${problemId}-${opt.id}`}
                                            />
                                            <Label
                                                htmlFor={`${problemId}-${opt.id}`}
                                                className="font-normal">
                                                <span className="font-semibold">
                                                    {opt.graderName}
                                                </span>
                                                :
                                                {isStandard
                                                    ? opt.isCorrect
                                                        ? " Correct"
                                                        : " Incorrect"
                                                    : ` ${opt.answer}`}
                                            </Label>
                                        </div>
                                    ))}

                                    <div className="flex items-center space-x-2 mt-2">
                                        <RadioGroupItem
                                            value="new"
                                            id={`${problemId}-new`}
                                        />
                                        <Label htmlFor={`${problemId}-new`}>
                                            Enter New Grade
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {res.choice === "new" && (
                                    <div className="mt-3 ml-6 space-y-2">
                                        {isStandard ? (
                                            <div className="flex items-center gap-2">
                                                <Label>Correct?</Label>
                                                <Switch
                                                    checked={
                                                        res.customIsCorrect ===
                                                        true
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        setResolutions(
                                                            (prev) => ({
                                                                ...prev,
                                                                [problemId]: {
                                                                    ...prev[
                                                                        problemId
                                                                    ],
                                                                    customIsCorrect:
                                                                        checked,
                                                                },
                                                            })
                                                        )
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <Input
                                                placeholder="Enter answer"
                                                value={res.customAnswer}
                                                onChange={(e) =>
                                                    setResolutions((prev) => ({
                                                        ...prev,
                                                        [problemId]: {
                                                            ...prev[problemId],
                                                            customAnswer:
                                                                e.target.value,
                                                        },
                                                    }))
                                                }
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end">
                                    <Button
                                        onClick={() => handleResolve(problemId)}
                                        disabled={!res.choice}>
                                        Resolve
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Modal>
    );
}

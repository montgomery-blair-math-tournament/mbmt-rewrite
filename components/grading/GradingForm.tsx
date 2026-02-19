"use client";

import { useEffect, useState } from "react";
import { submitGrades, GradeSubmission } from "@/app/actions/grading";
import { getGradingStatus } from "@/app/actions/grading-data";
import { Problem } from "@/lib/schema/problem";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ConflictConfirmationModal from "./ConflictConfirmationModal";

type GradingFormProps = {
    type: "participant" | "team";
    id: number;
    roundId: number;
    problems: Problem[];
    onSuccess: () => void;
};

export default function GradingForm({
    type,
    id,
    roundId,
    problems,
    onSuccess,
}: GradingFormProps) {
    const [grades, setGrades] = useState<
        Record<number, { isCorrect: boolean | null; answer: string }>
    >({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [gradingStatus, setGradingStatus] = useState<
        Record<number, string[]>
    >({});
    const [hasGradedMap, setHasGradedMap] = useState<Record<number, boolean>>(
        {}
    );
    const [conflictData, setConflictData] = useState<{
        isOpen: boolean;
        conflicts: any[];
    }>({ isOpen: false, conflicts: [] });
    const [regradeModalOpen, setRegradeModalOpen] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true);
            try {
                // @ts-ignore - Updated return type
                const { statusMap, hasGradedMap } = await getGradingStatus(
                    type,
                    id,
                    roundId
                );
                setGradingStatus(statusMap);
                setHasGradedMap(hasGradedMap);

                // Initialize grades
                const initialGrades: Record<
                    number,
                    { isCorrect: boolean | null; answer: string }
                > = {};

                problems.forEach((p) => {
                    if (p.type === "standard" || p.type === "boolean") {
                        initialGrades[p.id] = {
                            isCorrect: false, // Default to False (Included/Incorrect)
                            answer: "",
                        };
                    } else {
                        initialGrades[p.id] = {
                            isCorrect: false, // Default to False (Active) so it shows input.
                            answer: "",
                        };
                    }
                });
                setGrades(initialGrades);
            } catch (error) {
                console.error("Failed to fetch grading status", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStatus();
        }
    }, [id, roundId, type, problems]);

    const performSubmit = async (confirm = false) => {
        setSubmitting(true);
        const submissions: GradeSubmission[] = [];

        problems.forEach((p) => {
            const g = grades[p.id];
            if (g) {
                const isStandard =
                    p.type === "standard" || p.type === "boolean";
                submissions.push({
                    type,
                    id,
                    roundId,
                    problemId: p.id,
                    answer: g.answer || null,
                    isCorrect: isStandard ? (g.isCorrect ?? null) : null, // Force null for custom
                });
            }
        });

        // @ts-ignore - submitGrades signature allows second arg now
        const res = await submitGrades(submissions, confirm);

        if (res.error) {
            toast.error(res.error);
        } else if (res.status === "CONFLICT") {
            setConflictData({
                isOpen: true,
                conflicts: res.conflicts || [],
            });
        } else {
            toast.success("Grades submitted");
            onSuccess();
        }
        setSubmitting(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let hasRegrade = false;
        problems.forEach((p) => {
            if (hasGradedMap[p.id]) {
                hasRegrade = true;
            }
        });

        if (hasRegrade) {
            setRegradeModalOpen(true);
        } else {
            performSubmit(false);
        }
    };

    const updateGrade = (
        problemId: number,
        update: Partial<{ isCorrect: boolean | null; answer: string }>
    ) => {
        setGrades((prev) => ({
            ...prev,
            [problemId]: {
                ...(prev[problemId] || { isCorrect: null, answer: "" }),
                ...update,
            },
        }));
    };

    if (loading) return <div>Loading grades...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                {problems.map((problem) => {
                    const grade = grades[problem.id];
                    const currentGrade = grade || {
                        isCorrect: null,
                        answer: "",
                    };
                    const isUnmarked =
                        currentGrade.isCorrect === null &&
                        (!currentGrade.answer || currentGrade.answer === "");

                    const isStandard =
                        problem.type === "standard" ||
                        problem.type === "boolean";

                    return (
                        <div
                            key={problem.id}
                            className={cn(
                                "flex items-center justify-between p-3 border rounded-lg transition-colors",
                                isUnmarked
                                    ? "bg-gray-50 border-gray-200 opacity-75"
                                    : "bg-white border-gray-300"
                            )}>
                            <div className="flex-1">
                                <Label
                                    className={cn(
                                        "text-base font-medium",
                                        isUnmarked && "text-gray-500"
                                    )}>
                                    Problem {problem.number}{" "}
                                    {problem.points > 1 &&
                                        `(${problem.points} pts)`}
                                </Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {problem.problem}
                                    </p>
                                    {gradingStatus[problem.id] &&
                                        gradingStatus[problem.id].length >
                                            0 && (
                                            <p className="text-xs text-blue-600 font-medium">
                                                Graded by:{" "}
                                                {gradingStatus[problem.id].join(
                                                    ", "
                                                )}
                                            </p>
                                        )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {isStandard ? (
                                    <div className="flex items-center gap-2">
                                        <Label
                                            className={cn(
                                                "cursor-pointer min-w-[4rem] text-right",
                                                isUnmarked && "text-gray-400"
                                            )}>
                                            {currentGrade.isCorrect === true
                                                ? "Correct"
                                                : currentGrade.isCorrect ===
                                                    false
                                                  ? "Incorrect"
                                                  : "Unmarked"}
                                        </Label>
                                        <Switch
                                            checked={
                                                currentGrade.isCorrect === true
                                            }
                                            onCheckedChange={(checked) => {
                                                updateGrade(problem.id, {
                                                    isCorrect: checked,
                                                });
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={currentGrade.answer}
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                updateGrade(problem.id, {
                                                    answer: newVal,
                                                    isCorrect:
                                                        currentGrade.isCorrect ===
                                                        null
                                                            ? false
                                                            : currentGrade.isCorrect,
                                                });
                                            }}
                                            placeholder="Answer..."
                                            className={cn(
                                                "w-32",
                                                isUnmarked && "bg-gray-100"
                                            )}
                                        />
                                    </div>
                                )}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (isUnmarked) {
                                            updateGrade(
                                                problem.id,
                                                isStandard
                                                    ? {
                                                          isCorrect: false,
                                                          answer: "",
                                                      }
                                                    : {
                                                          answer: "",
                                                          isCorrect: false,
                                                      }
                                            );
                                        } else {
                                            updateGrade(problem.id, {
                                                isCorrect: null,
                                                answer: "",
                                            });
                                        }
                                    }}
                                    className={cn(
                                        "h-8 px-2 text-xs",
                                        isUnmarked
                                            ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            : "text-gray-400 hover:text-gray-600"
                                    )}>
                                    {isUnmarked ? "Mark" : "Unmark"}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Submit Grades"}
                </Button>
            </div>

            <ConflictConfirmationModal
                isOpen={conflictData.isOpen}
                onClose={() =>
                    setConflictData({ ...conflictData, isOpen: false })
                }
                onConfirm={() => {
                    setConflictData({ ...conflictData, isOpen: false });
                    performSubmit(true);
                }}
                conflicts={conflictData.conflicts}
                problems={problems}
            />

            {regradeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4 space-y-4 shadow-lg border">
                        <h3 className="text-lg font-bold">Already Graded</h3>
                        <p className="text-sm text-gray-600">
                            You have already graded some of these problems.
                            Submitting again will create a new entry in the
                            history.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRegradeModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setRegradeModalOpen(false);
                                    performSubmit(false);
                                }}>
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}

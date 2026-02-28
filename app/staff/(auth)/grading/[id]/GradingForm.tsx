"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitGrades } from "@/app/actions/grading";
import { GradeSubmission } from "@/lib/schema/grading";
import { getGradingStatus } from "@/app/actions/grading-data";
import { Problem } from "@/lib/schema/problem";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ConflictConfirmationModal from "./ConflictConfirmationModal";
import Modal from "@/components/Modal";

const formSchema = z.object({
    grades: z.record(
        z.string(),
        z.object({
            isCorrect: z.boolean().nullable(),
            answer: z.string().optional(),
        })
    ),
});

export default function GradingForm({
    type,
    id,
    roundId,
    problems,
    onSuccess,
}: {
    type: "participant" | "team";
    id: number;
    roundId: number;
    problems: Problem[];
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [gradingStatus, setGradingStatus] = useState<
        // Problem id, grader name(s)
        Record<number, string[]>
    >({});
    const [hasGradedMap, setHasGradedMap] = useState<Record<number, boolean>>(
        {}
    );
    const [conflictData, setConflictData] = useState<{
        isOpen: boolean;
        conflicts: { problemId: number }[];
    }>({ isOpen: false, conflicts: [] });
    const [regradeModalOpen, setRegradeModalOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            grades: {},
        },
    });

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getGradingStatus(type, id);

                if (!res) {
                    throw new Error("Failed to load status");
                }

                setGradingStatus(res.statusMap);
                setHasGradedMap(res.hasGradedMap);

                const initialGrades: Record<
                    string,
                    { isCorrect: boolean | null; answer: string }
                > = {};

                problems.forEach((p) => {
                    initialGrades[p.id.toString()] = {
                        isCorrect: false,
                        answer: "",
                    };
                });

                form.reset({ grades: initialGrades });
            } catch (error) {
                toast.error("Failed to fetch grading status");
                console.error("Failed to fetch grading status", error);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, roundId, type, problems, form]);

    const performSubmit = async (confirm = false) => {
        setSubmitting(true);
        const submissions: GradeSubmission[] = [];
        const values = form.getValues();

        problems.forEach((p) => {
            const g = values.grades[p.id.toString()];
            if (g) {
                const isStandard =
                    p.type === "standard" || p.type === "boolean";
                const isUnmarked =
                    g.isCorrect === null && (!g.answer || g.answer === "");
                if (!isUnmarked) {
                    submissions.push({
                        type,
                        id,
                        roundId,
                        problemId: p.id,
                        answer: g.answer || null,
                        isCorrect: isStandard ? (g.isCorrect ?? null) : null,
                    });
                }
            }
        });

        if (submissions.length === 0) {
            toast.error("No grades to submit");
            setSubmitting(false);
            return;
        }

        const res = await submitGrades(submissions, confirm);

        if (res.error) {
            toast.error(res.error);
        } else if (res.status === "CONFLICT" && !res.success) {
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

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        let hasRegrade = false;
        problems.forEach((p) => {
            const g = values.grades[p.id.toString()];
            const isUnmarked =
                g?.isCorrect === null && (!g?.answer || g?.answer === "");
            if (hasGradedMap[p.id] && !isUnmarked) {
                hasRegrade = true;
            }
        });

        if (hasRegrade) {
            setRegradeModalOpen(true);
        } else {
            performSubmit(false);
        }
    };

    if (loading)
        return <div className="p-4 text-center">Loading grades...</div>;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto p-1">
                    {problems.map((problem) => {
                        const pidStr = problem.id.toString();
                        const currentGrade = form.watch(`grades.${pidStr}`);
                        if (!currentGrade) return null;

                        const isUnmarked =
                            currentGrade.isCorrect === null &&
                            (!currentGrade.answer ||
                                currentGrade.answer === "");
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
                                <div className="flex-1 pr-4">
                                    <Label
                                        className={cn(
                                            "text-base font-medium",
                                            isUnmarked && "text-gray-500"
                                        )}>
                                        Problem {problem.number}{" "}
                                        {problem.points > 1 &&
                                            `(${problem.points} pts)`}
                                    </Label>
                                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground truncate max-w-50">
                                            {problem.problem}
                                        </p>
                                        {gradingStatus[problem.id] &&
                                            gradingStatus[problem.id].length >
                                                0 && (
                                                <p className="text-xs text-red-600 font-medium">
                                                    Graded by:{" "}
                                                    {gradingStatus[
                                                        problem.id
                                                    ].join(", ")}
                                                </p>
                                            )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {isStandard ? (
                                        <FormField
                                            control={form.control}
                                            name={`grades.${pidStr}.isCorrect`}
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-2 mb-0">
                                                    <Label
                                                        className={cn(
                                                            "cursor-pointer min-w-16 text-right",
                                                            isUnmarked &&
                                                                "text-gray-400"
                                                        )}>
                                                        {field.value === true
                                                            ? "Correct"
                                                            : field.value ===
                                                                false
                                                              ? "Incorrect"
                                                              : "Unmarked"}
                                                    </Label>
                                                    <FormControl>
                                                        <Switch
                                                            checked={
                                                                field.value ===
                                                                true
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) => {
                                                                field.onChange(
                                                                    checked
                                                                );
                                                            }}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <FormField
                                            control={form.control}
                                            name={`grades.${pidStr}.answer`}
                                            render={({ field }) => (
                                                <FormItem className="mb-0 gap-0">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(
                                                                    e
                                                                );
                                                                if (
                                                                    currentGrade.isCorrect ===
                                                                    null
                                                                ) {
                                                                    form.setValue(
                                                                        `grades.${pidStr}.isCorrect`,
                                                                        false
                                                                    );
                                                                }
                                                            }}
                                                            placeholder="Answer..."
                                                            className={cn(
                                                                "w-32",
                                                                isUnmarked &&
                                                                    "bg-gray-100"
                                                            )}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (isUnmarked) {
                                                form.setValue(
                                                    `grades.${pidStr}.isCorrect`,
                                                    false
                                                );
                                                form.setValue(
                                                    `grades.${pidStr}.answer`,
                                                    ""
                                                );
                                            } else {
                                                form.setValue(
                                                    `grades.${pidStr}.isCorrect`,
                                                    null
                                                );
                                                form.setValue(
                                                    `grades.${pidStr}.answer`,
                                                    ""
                                                );
                                            }
                                        }}
                                        className={cn(
                                            "h-8 px-2 text-xs",
                                            isUnmarked
                                                ? "text-red-600 hover:text-red-800 hover:bg-red-50"
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

                <Modal
                    isOpen={regradeModalOpen}
                    onClose={() => setRegradeModalOpen(false)}
                    title="Already Graded"
                    className="w-full max-w-sm h-auto"
                    footer={
                        <>
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
                        </>
                    }>
                    <div className="py-2">
                        <p className="text-sm text-gray-600">
                            You have already graded some of these problems.
                            Submitting again will create a new entry in the
                            history.
                        </p>
                    </div>
                </Modal>
            </form>
        </Form>
    );
}

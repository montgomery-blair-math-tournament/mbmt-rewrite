"use client";

import { Problem } from "@/lib/schema/problem";
import { useEffect, useState } from "react";
import Label from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { submitGrades } from "./gutsGrading";
import { GutsGradeSubmission } from "@/lib/schema/grading";
import { toast } from "sonner";

const formSchema = z.object({
    grades: z.record(
        z.string(),
        z.object({
            is_correct: z.boolean(),
            answer: z.string().optional(),
        })
    ),
});

export default function GutsGradingForm({
    problems,
    teamId,
    roundId,
    onSuccess,
}: {
    roundId: number;
    teamId: number;
    problems: (Omit<Problem, "guts_section"> & {
        guts_section: number;
    })[];
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [, setSectionSelect] = useState(0);
    const [problemsForEachSection, setProblemsForEachSection] = useState<
        { section: number; problems: Problem[] }[]
    >([]);
    const [problemsForThisSection, setProblemsForThisSection] = useState<
        Problem[]
    >([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            grades: {} as Record<
                string,
                { is_correct: boolean; answer: string }
            >,
        },
    });

    useEffect(() => {
        (async () => {
            const problemMap: { section: number; problems: Problem[] }[] = [];

            problems.map((problem) => {
                const found = problemMap.find(
                    (problemsSection) =>
                        problemsSection.section === problem.guts_section
                );
                if (found) {
                    found.problems.push(problem);
                } else {
                    problemMap.push({
                        section: problem.guts_section,
                        problems: [problem],
                    });
                }
            });

            problemMap.sort((p1, p2) => p1.section - p2.section);
            setProblemsForEachSection(problemMap);

            // Initialize form values for all problems
            const initialGrades: Record<
                string,
                { is_correct: boolean; answer: string }
            > = {};
            problemsForThisSection.forEach((problem) => {
                initialGrades[problem.id.toString()] = {
                    is_correct: false,
                    answer: "",
                };
            });
            form.reset({ grades: initialGrades });

            setLoading(false);
        })();
    }, [problems, roundId, form, problemsForThisSection]);

    if (loading)
        return <div className="p-4 text-center">Loading grades...</div>;

    async function handleSubmit(values: z.infer<typeof formSchema>) {
        setSubmitting(true);

        const submissions: GutsGradeSubmission[] = [];

        problems.forEach((p) => {
            const grades = values.grades[p.id.toString()];
            if (grades) {
                const isStandard =
                    p.type === "standard" || p.type === "boolean";
                const isUnmarked =
                    grades.is_correct === null &&
                    (!grades.answer || grades.answer === "");
                if (!isUnmarked) {
                    submissions.push({
                        id: teamId,
                        round_id: roundId,
                        problem_id: p.id,
                        answer: grades.answer || "",
                        is_correct: isStandard
                            ? (grades.is_correct ?? false)
                            : false,
                    });
                }
            }
        });

        if (submissions.length === 0) {
            toast.error("No grades to submit");
            setSubmitting(false);
            return;
        }

        const res = await submitGrades(submissions);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Grades submitted");
            onSuccess();
        }

        setSubmitting(false);
        onSuccess();
    }

    async function setCurrentSection(section: number) {
        setSectionSelect(section);
        setProblemsForThisSection(
            problemsForEachSection
                .filter((pSet) => pSet.section === section)[0]
                .problems.sort((a, b) => a.number - b.number)
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Guts section selection */}
            <div>
                <Label className="mb-2 block">Select section to grade</Label>
                <RadioGroup
                    onValueChange={(val) => setCurrentSection(parseInt(val))}>
                    {problemsForEachSection.map(({ section, problems }) => {
                        const probsMap = problems.map((p) => p.number).sort();
                        return (
                            <div
                                key={section}
                                className="flex items-center gap-2">
                                <RadioGroupItem
                                    value={section.toString()}
                                    id={`set-guts-grading-section-${section}`}
                                />
                                <Label
                                    htmlFor={`set-guts-grading-section-${section}`}>
                                    {`Section ${section}, problem(s) ${probsMap[0]}-${probsMap[probsMap.length - 1]}`}
                                </Label>
                            </div>
                        );
                    })}
                </RadioGroup>
            </div>

            {/* Problem grading */}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto p-1">
                        {problemsForThisSection.map((problem) => {
                            const problemIdString = problem.id.toString();
                            const isStandard =
                                problem.type === "standard" ||
                                problem.type === "boolean";

                            return (
                                <div
                                    key={problem.id}
                                    className="flex items-center justify-between p-3 border rounded-lg transition-colors">
                                    <div className="flex-1 pr-4">
                                        <Label className="text-base font-medium">
                                            Problem {problem.number}{" "}
                                            {`(${problem.points} pts)`}
                                        </Label>
                                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                                            <p className="text-xs text-muted-foreground truncate max-w-50">
                                                {problem.problem}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isStandard ? (
                                            <FormField
                                                control={form.control}
                                                name={`grades.${problemIdString}.is_correct`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2 mb-0">
                                                        <Label className="cursor-pointer min-w-16 text-right">
                                                            {field.value
                                                                ? "Correct"
                                                                : "Incorrect"}
                                                        </Label>
                                                        <FormControl>
                                                            <Switch
                                                                checked={
                                                                    field.value ??
                                                                    false
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
                                                name={`grades.${problemIdString}.answer`}
                                                render={({ field }) => (
                                                    <FormItem className="mb-0 gap-0">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    field.onChange(
                                                                        e
                                                                    );
                                                                    form.setValue(
                                                                        `grades.${problemIdString}.is_correct`,
                                                                        false
                                                                    );
                                                                }}
                                                                placeholder="Answer..."
                                                                className="w-32"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
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
                </form>
            </Form>
        </div>
    );
}

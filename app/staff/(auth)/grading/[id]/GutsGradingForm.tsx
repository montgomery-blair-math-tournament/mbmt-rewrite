"use client";

import { Problem } from "@/lib/schema/problem";
import { useEffect, useState } from "react";
import Label from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const formSchema = z.object({
    grades: z.record(
        z.string(),
        z.object({
            is_correct: z.boolean().nullable(),
            answer: z.string().optional(),
        })
    ),
});

export default function GutsGradingForm({
    problems,
    roundId,
    onSuccess,
}: {
    roundId: number;
    problems: (Omit<Problem, "guts_section"> & {
        guts_section: number;
    })[];
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sectionSelect, setSectionSelect] = useState(0);
    const [problemsForEachSection, setProblemsForEachSection] = useState<
        { section: number; problems: Problem[] }[]
    >([]);
    const [problemsForThisSection, setProblemsForThisSection] = useState<
        Problem[]
    >([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            grades: {},
        },
    });

    useEffect(() => {
        (async () => {
            const problemMap: { section: number; problems: Problem[] }[] = [];

            problems.map((problem) => {
                const found = problemMap.find(
                    (pSet) => pSet.section === problem.guts_section
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

            setLoading(false);
        })();
    }, [problems, roundId]);

    if (loading)
        return <div className="p-4 text-center">Loading grades...</div>;

    async function handleSubmit() {
        setSubmitting(true);

        setSubmitting(false);
        onSuccess();
    }

    async function setCurrentSection(section: number) {
        setSectionSelect(section);
        setProblemsForThisSection(
            problemsForEachSection.filter((pSet) => pSet.section === section)[0]
                .problems
        );
    }

    return (
        <div className="flex flex-col gap-6">
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
            <Form {...form}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto p-1">
                        {problems.map((problem) => {
                            const problemIdString = problem.id.toString();
                            const currentGrade = form.watch(
                                `grades.${problemIdString}`
                            );
                            if (!currentGrade) return null;

                            const isUnmarked =
                                currentGrade.is_correct === null &&
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
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isStandard ? (
                                            <FormField
                                                control={form.control}
                                                name={`grades.${problemIdString}.isCorrect`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2 mb-0">
                                                        <Label
                                                            className={cn(
                                                                "cursor-pointer min-w-16 text-right",
                                                                isUnmarked &&
                                                                    "text-gray-400"
                                                            )}>
                                                            {field.value ===
                                                            true
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
                                                                    if (
                                                                        currentGrade.is_correct ===
                                                                        null
                                                                    ) {
                                                                        form.setValue(
                                                                            `grades.${problemIdString}.is_correct`,
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
                                                        `grades.${problemIdString}.is_correct`,
                                                        false
                                                    );
                                                    form.setValue(
                                                        `grades.${problemIdString}.answer`,
                                                        ""
                                                    );
                                                } else {
                                                    form.setValue(
                                                        `grades.${problemIdString}.is_correct`,
                                                        null
                                                    );
                                                    form.setValue(
                                                        `grades.${problemIdString}.answer`,
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
                </form>
            </Form>
        </div>
    );
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type GradeSubmission = {
    type: "participant" | "team";
    id: number;
    roundId: number;
    problemId: number;
    answer: string | null;
    isCorrect: boolean | null;
    isForce?: boolean; // Used to override conflicts explicitly
};

export async function submitGrades(
    submissions: GradeSubmission[],
    confirm: boolean = false
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    if (submissions.length === 0) return { success: true };

    const type = submissions[0].type;
    const participantId = submissions[0].id;
    const roundId = submissions[0].roundId; // Assuming all for same round/participant

    const table =
        type === "participant" ? "participant_grading" : "team_grading";
    const scoreTable =
        type === "participant" ? "participant_score" : "team_score";
    const foreignKey = type === "participant" ? "participant_id" : "team_id";

    try {
        // 1. Conflict Detection
        // If not checking specifically for force override (conflict resolution modal uses isForce=true per item)
        // But the new requirement is "Review" or "Confirm Submit" for ANY discrepancy.
        // So we need to check against LATEST grades from OTHER graders.

        if (!confirm) {
            const conflicts: { problemId: number; existingGrades: any[] }[] =
                [];

            // Get all latest grades for these problems
            // We need to query the DB for current state of these problems.
            // "Current state" = for each problem, what is the consensus or latest grade?
            // If we just check "is there a different grade?", we need to fetch all grades for these problems.

            const problemIds = submissions.map((s) => s.problemId);

            const { data: existingData } = await supabase
                .from(table)
                .select("*")
                .eq(foreignKey, participantId)
                .in("problem_id", problemIds);

            // Group existing by problem
            const existingMap = new Map<number, any[]>();
            existingData?.forEach((row) => {
                if (!existingMap.has(row.problem_id))
                    existingMap.set(row.problem_id, []);
                existingMap.get(row.problem_id)?.push(row);
            });

            for (const sub of submissions) {
                if (sub.isForce) continue; // Skip conflict check if forced (from resolution modal?)

                const existing = existingMap.get(sub.problemId);
                // User requirement: "do not treat submissions by the same person ANY different".
                // So checking against ALL existing grades, including my own previous ones.
                if (!existing || existing.length === 0) continue;

                // Compare
                // Note: Standard problems use isCorrect, custom use answer.
                // We should compare what is provided.
                let isDifference = false;
                for (const e of existing) {
                    if (
                        sub.answer !== null &&
                        e.answer !== null &&
                        sub.answer !== e.answer
                    ) {
                        isDifference = true;
                    }
                    if (
                        sub.isCorrect !== null &&
                        e.is_correct !== null &&
                        sub.isCorrect !== e.is_correct
                    ) {
                        isDifference = true;
                    }
                }

                // "Custom: custom should strip but not do anything else like uppercasing"
                // We should probably normalize BEFORE comparing if the requirement says "Custom... strip".
                // But the requirement says "For custom, it should strip...". This implies submitting logic.

                if (isDifference) {
                    conflicts.push({
                        problemId: sub.problemId,
                        existingGrades: existing,
                    });
                }
            }

            if (conflicts.length > 0) {
                return {
                    status: "CONFLICT",
                    conflicts,
                };
            }
        }

        // 2. Prepare Inserts
        const inserts = submissions.map((s) => {
            let answer = s.answer;
            // "For custom, it should strip but not do anything else"
            if (answer) {
                answer = answer.trim();
            }

            return {
                [foreignKey]: s.id,
                problem_id: s.problemId,
                grader_id: user.id,
                answer: answer,
                is_correct: s.isCorrect,
                is_force: s.isForce || false, // If confirmed, it's not necessarily "force" (admin override), just a confirmed submission.
                // But maybe "force" implies "overrules consensus"?
                // Let's keep is_force as passed.
            };
        });

        // 3. Insert specific problems
        const { error } = await supabase.from(table).insert(inserts);

        if (error) {
            console.error("Submission error:", error);
            return { error: "Failed to submit grades" };
        }

        // 4. Update Scores
        // Calculate the current score and status.
        // Fetch Round Type to determine grading rules
        const { data: round } = await supabase
            .from("round")
            .select("type")
            .eq("id", roundId)
            .single();

        const isGuts = round?.type?.toLowerCase().includes("guts");

        // Fetch ALL latest grades for this participant/round.
        const { data: allGrades } = await supabase
            .from(table)
            .select("*")
            .eq(foreignKey, participantId);

        const { data: roundProblems } = await supabase
            .from("problem")
            .select("id, points, type")
            .eq("round_id", roundId);

        const problemMap = new Map<number, { points: number; type: string }>();
        roundProblems?.forEach((p) =>
            problemMap.set(p.id, { points: p.points, type: p.type })
        );

        // Group grades by problem
        const gradesByProblem = new Map<number, any[]>();
        allGrades?.forEach((g) => {
            if (problemMap.has(g.problem_id)) {
                if (!gradesByProblem.has(g.problem_id))
                    gradesByProblem.set(g.problem_id, []);
                gradesByProblem.get(g.problem_id)?.push(g);
            }
        });

        // Determine Status and Score
        let totalScore = 0;
        let conflictCount = 0;
        let completedProblemsCount = 0;
        let gradedProblemsCount = 0; // Tracks if at least one grade exists
        const totalProblems = roundProblems?.length || 0;

        for (const p of roundProblems || []) {
            const grades = gradesByProblem.get(p.id);
            // Filter out "Unmarked" grades (effectively not graded)
            // Standard: is_correct is null -> Unmarked
            // Custom: answer is empty/null -> Unmarked
            const validGrades = grades
                ? grades.filter((g) => {
                      if (p.type === "standard" || p.type === "boolean") {
                          return g.is_correct !== null;
                      } else {
                          return g.answer && g.answer.trim() !== "";
                      }
                  })
                : [];

            if (validGrades.length === 0) continue;

            gradedProblemsCount++;

            // Sort by createdAt desc to process latest per grader
            // Sort by createdAt desc generally?
            // If we treat all submissions as distinct "votes", we just use validGrades directly.
            // User: "do not treat submissions by the same person ANY different".
            // So if I submitted 3 times and someone else 1 time, that is 4 grades.

            // We still sort them for "First" (Latest) comparison?
            // Logic uses `uniqueGrades[0]` as `first`.
            // So we want the LATEST submission to be the reference point?
            validGrades.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );

            const uniqueGrades = validGrades; // No deduplication
            const numGraders = uniqueGrades.length; // Actually numSubmissions

            let isConflict = false;
            let isConfirmed = false;
            let problemScore = 0;

            if (isGuts) {
                // Guts: Requires 1 grader.
                // If multiple graders exist, check for conflict?
                // "For guts round, it should only require 1 grader... Conflicting problems count as 0."
                if (numGraders > 1) {
                    // Check match
                    const first = uniqueGrades[0];
                    const mismatch = uniqueGrades.some((g) => {
                        if (g.is_force) return false; // Force ignores conflict logic if present? Assuming force resolves it.

                        const isStandard =
                            p.type === "standard" || p.type === "boolean";
                        if (isStandard) {
                            return g.is_correct !== first.is_correct;
                        } else {
                            const a1 = (g.answer || "").trim();
                            const a2 = (first.answer || "").trim();
                            return a1 !== a2;
                        }
                    });
                    if (mismatch) isConflict = true;
                }

                if (isConflict) {
                    problemScore = 0;
                } else {
                    // Score based on latest (or any, since they match/is single)
                    // If uniqueGrades[0] says Correct -> Points
                    if (uniqueGrades[0].is_correct) {
                        problemScore = p.points;
                    }
                    isConfirmed = true; // 1 grader is enough
                }
            } else {
                // Standard (Indiv/Team): Requires 2 corroborating submissions.

                if (numGraders >= 2) {
                    // Check corroboration
                    const first = uniqueGrades[0];
                    const mismatch = uniqueGrades.some((g) => {
                        if (g.is_force) return false;

                        const isStandard =
                            p.type === "standard" || p.type === "boolean";
                        if (isStandard) {
                            // Standard: strict equality on is_correct.
                            // Handle nulls? If one is null (unmarked) and other is true/false, it is mismatch?
                            // But unmarked usually doesn't happen in "Latest" if we are determining status?
                            // If a grader submitted "Unmarked", does it count?
                            // Probably.
                            return g.is_correct !== first.is_correct;
                        } else {
                            // Custom: Compare answer (normalized)
                            const a1 = (g.answer || "").trim();
                            const a2 = (first.answer || "").trim();
                            return a1 !== a2;
                        }
                    });

                    if (mismatch) {
                        isConflict = true;
                        problemScore = 0; // "Conflicting problems count as 0"
                    } else {
                        // Corroborated!
                        isConfirmed = true;
                        if (p.type === "standard" || p.type === "boolean") {
                            if (first.is_correct) {
                                problemScore = p.points;
                            }
                        } else {
                            // Custom: Corroborated -> Full points
                            problemScore = p.points;
                        }
                    }
                } else {
                    // numGraders == 1 (or 0, handled above)
                    // "Partillay graded/incomplete (meaning not enough for confirmation) should still count as full grade"
                    // NOT Confirmed.
                    if (p.type === "standard" || p.type === "boolean") {
                        if (uniqueGrades[0].is_correct) {
                            problemScore = p.points;
                        }
                    } else {
                        // Custom: Single grade -> Points
                        problemScore = p.points;
                    }
                }
            }

            if (isConflict) {
                conflictCount++;
            }

            if (isConfirmed) {
                completedProblemsCount++;
            }

            // Add to total score (unless conflict set it to 0)
            totalScore += problemScore;
        }

        let status = "NOT_STARTED";
        if (conflictCount > 0) {
            status = "CONFLICT";
        } else if (
            completedProblemsCount >= totalProblems &&
            totalProblems > 0
        ) {
            status = "COMPLETED";
        } else if (gradedProblemsCount > 0) {
            status = "IN_PROGRESS";
        }

        await supabase.from(scoreTable).upsert(
            {
                [foreignKey]: participantId,
                round_id: roundId,
                score: totalScore,
                status: status,
            },
            { onConflict: `${foreignKey}, round_id` }
        );

        revalidatePath(`/staff/grading/${roundId}`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Server error" };
    }
}

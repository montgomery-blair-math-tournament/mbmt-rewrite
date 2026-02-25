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

// Helper to check for mismatch between two grades
function checkMismatch(g1: any, g2: any, problemType: string): boolean {
    // If either is forced, we might want to skip conflict?
    // Logic: If one is forced, maybe it overrides?
    // Current logic in loop: "if (g.is_force) return false" (ignore this grade as a source of conflict?)
    // Let's keep the comparison strict here and handle force in the loop.

    const isStandard = problemType === "standard" || problemType === "boolean";
    if (isStandard) {
        return g1.is_correct !== g2.is_correct;
    } else {
        const a1 = (g1.answer || "").trim();
        const a2 = (g2.answer || "").trim();
        return a1 !== a2;
    }
}

async function calculateRoundScore(
    supabase: any,
    roundId: number,
    participantId: number,
    type: "participant" | "team"
) {
    const table =
        type === "participant" ? "participant_grading" : "team_grading";
    const scoreTable =
        type === "participant" ? "participant_score" : "team_score";
    const foreignKey = type === "participant" ? "participant_id" : "team_id";

    // Fetch Round Type
    const { data: round } = await supabase
        .from("round")
        .select("type")
        .eq("id", roundId)
        .single();
    const isGuts = round?.type?.toLowerCase().includes("guts");

    // Fetch Problems
    const { data: roundProblems } = await supabase
        .from("problem")
        .select("id, points, type")
        .eq("round_id", roundId);

    // Fetch All Grades
    const { data: allGrades } = await supabase
        .from(table)
        .select("*")
        .eq(foreignKey, participantId);

    // Group grades
    const gradesByProblem = new Map<number, any[]>();
    allGrades?.forEach((g: any) => {
        if (!gradesByProblem.has(g.problem_id))
            gradesByProblem.set(g.problem_id, []);
        gradesByProblem.get(g.problem_id)?.push(g);
    });

    let totalScore = 0;
    let conflictCount = 0;
    let completedProblemsCount = 0;
    let gradedProblemsCount = 0;
    const totalProblems = roundProblems?.length || 0;

    for (const p of roundProblems || []) {
        const grades = gradesByProblem.get(p.id);

        // Filter valid grades
        const validGrades = grades
            ? grades.filter((g: any) => {
                  if (p.type === "standard" || p.type === "boolean") {
                      return g.is_correct !== null;
                  } else {
                      return g.answer && g.answer.trim() !== "";
                  }
              })
            : [];

        if (validGrades.length === 0) continue;
        gradedProblemsCount++;

        // Sort by LATEST
        validGrades.sort(
            (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );

        // DO NOT deduplicate by grader. Treat every valid submission as a vote.
        const uniqueGrades = validGrades;
        const numGraders = uniqueGrades.length;

        let isConflict = false;
        let isConfirmed = false;
        let problemScore = 0;

        // Conflict Logic
        const threshold = isGuts ? 1 : 2; // Guts needs 1, Standard needs 2

        if (numGraders > 1) {
            // If multiple votes, check consistency
            const first = uniqueGrades[0];
            const mismatch = uniqueGrades.some((g: any) => {
                if (g.is_force) return false;
                return checkMismatch(g, first, p.type);
            });
            if (mismatch) isConflict = true;
        }

        if (isConflict) {
            problemScore = 0;
            conflictCount++;
        } else {
            // No conflict. Check confirmation.
            if (numGraders >= threshold) {
                isConfirmed = true;
                completedProblemsCount++;
            }

            // Score based on latest (first)
            // For Standard: is_correct
            // For Custom: always full points if matched/active?
            // Logic: "Custom: Corroborated -> Full points"
            if (p.type === "standard" || p.type === "boolean") {
                if (uniqueGrades[0].is_correct) {
                    problemScore = p.points;
                }
            } else {
                problemScore = p.points;
            }
        }
        totalScore += problemScore;
    }

    let status = "NOT_STARTED";
    if (conflictCount > 0) {
        status = "CONFLICT";
    } else if (completedProblemsCount >= totalProblems && totalProblems > 0) {
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
}

export async function submitGrades(
    submissions: GradeSubmission[],
    confirm: boolean = false
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };
    if (submissions.length === 0) return { success: true };

    const type = submissions[0].type;
    const participantId = submissions[0].id;
    const roundId = submissions[0].roundId;

    const table =
        type === "participant" ? "participant_grading" : "team_grading";
    const foreignKey = type === "participant" ? "participant_id" : "team_id";

    try {
        // 1. Conflict Detection (Pre-Check)
        if (!confirm) {
            const problemIds = submissions.map((s) => s.problemId);
            const { data: existingData } = await supabase
                .from(table)
                .select("*")
                .eq(foreignKey, participantId)
                .in("problem_id", problemIds);

            const { data: problems } = await supabase
                .from("problem")
                .select("id, type")
                .in("id", problemIds);

            const typeMap = new Map(problems?.map((p) => [p.id, p.type]));
            const existingMap = new Map<number, any[]>();
            existingData?.forEach((row) => {
                if (!existingMap.has(row.problem_id))
                    existingMap.set(row.problem_id, []);
                existingMap.get(row.problem_id)?.push(row);
            });

            const conflicts: { problemId: number; existingGrades: any[] }[] =
                [];

            for (const sub of submissions) {
                if (sub.isForce) continue;

                const existing = existingMap.get(sub.problemId);
                if (!existing || existing.length === 0) continue;

                const pType = typeMap.get(sub.problemId) || "standard";

                // Compare sub vs existing
                // sub isn't exactly a grade object, convert for helper?
                // Or just use manual check since helper expects DB shape?
                // Let's just compare.

                let isDifference = false;
                for (const e of existing) {
                    // Normalize sub to grade-like for comparison
                    const subGrade = {
                        answer: sub.answer,
                        is_correct: sub.isCorrect,
                    };
                    if (checkMismatch(subGrade, e, pType)) {
                        isDifference = true;
                        break;
                    }
                }

                if (isDifference) {
                    conflicts.push({
                        problemId: sub.problemId,
                        existingGrades: existing,
                    });
                }
            }

            if (conflicts.length > 0) {
                return { status: "CONFLICT", conflicts };
            }
        }

        // 2. Prepare Inserts
        const inserts = submissions.map((s) => {
            let answer = s.answer;
            if (answer) answer = answer.trim();
            return {
                [foreignKey]: s.id,
                problem_id: s.problemId,
                grader_id: user.id,
                answer: answer,
                is_correct: s.isCorrect,
                is_force: s.isForce || false,
            };
        });

        // 3. Insert
        const { error } = await supabase.from(table).insert(inserts);
        if (error) {
            console.error("Submission error:", error);
            return { error: "Failed to submit grades" };
        }

        // 4. Update Scores (Recalculate)
        await calculateRoundScore(supabase, roundId, participantId, type);

        revalidatePath(`/staff/grading/${roundId}`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Server error" };
    }
}

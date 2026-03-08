"use server";

import {
    GutsGradeSubmission,
    GutsGrading,
    gutsGradeSubmissionSchema,
} from "@/lib/schema/grading";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function submitGrades(rawSubmissions: GutsGradeSubmission[]) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const parseResult = z
        .array(gutsGradeSubmissionSchema)
        .safeParse(rawSubmissions);
    if (!parseResult.success) {
        return { error: "Invalid submission format" };
    }
    const submissions = parseResult.data;

    if (submissions.length === 0) return { success: true };

    const participantId = submissions[0].id;
    const roundId = submissions[0].round_id;

    try {
        const inserts = submissions.map((s) => {
            let answer = s.answer;
            if (answer) answer = answer.trim();
            return {
                team_id: s.id,
                problem_id: s.problem_id,
                grader_id: user.id,
                answer: answer,
                is_correct: s.is_correct,
            };
        });

        const { error } = await supabase.from("team_grading").insert(inserts);
        if (error) {
            console.error("Submission error:", error);
            return { error: "Failed to submit grades" };
        }

        const { status, totalScore } = await calculateRoundScore(
            roundId,
            participantId
        );

        revalidatePath(`/staff/grading/${roundId}`);
        return { success: true, status, score: totalScore };
    } catch (e) {
        console.error(e);
        return { error: "Server error" };
    }
}

export async function calculateRoundScore(roundId: number, teamId: number) {
    const supabase = await createClient();

    const { data: roundProblems } = await supabase
        .from("problem")
        .select("*")
        .eq("round_id", roundId);

    const { data: allGrades } = await supabase
        .from("team_grading")
        .select("*")
        .eq("team_id", teamId);

    const { status, totalScore } = await computeRoundScore(
        roundProblems || [],
        allGrades || []
    );

    const { error: upsertError } = await supabase.from("team_score").upsert(
        {
            team_id: teamId,
            round_id: roundId,
            score: totalScore,
            status: status,
        },
        { onConflict: "team_id, round_id" }
    );

    if (upsertError) {
        console.error("Failed to upsert score:", upsertError);
    }

    return { status, totalScore };
}

export async function computeRoundScore(
    roundProblems: { id: number; points: number; type: string }[],
    allGrades: GutsGrading[]
): Promise<{ status: string; totalScore: number }> {
    const gradesByProblem = new Map<number, GutsGrading[]>();
    allGrades.forEach((g) => {
        if (!gradesByProblem.has(g.problem_id))
            gradesByProblem.set(g.problem_id, []);
        gradesByProblem.get(g.problem_id)?.push(g);
    });

    let totalScore = 0;
    let completedProblemsCount = 0;
    let gradedProblemsCount = 0;
    const totalProblems = roundProblems.length;

    for (const p of roundProblems) {
        const grades = gradesByProblem.get(p.id);

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

        validGrades.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );

        const uniqueGrades = validGrades;
        const numGraders = uniqueGrades.length;

        let problemScore = 0;

        if (numGraders >= 1) {
            completedProblemsCount++;
        }

        if (p.type === "standard" || p.type === "boolean") {
            if (uniqueGrades[0].is_correct) {
                problemScore = p.points;
            }
        } else {
            problemScore = p.points;
        }
        totalScore += problemScore;
    }

    let status = "NOT_STARTED";

    if (completedProblemsCount >= totalProblems && totalProblems > 0) {
        status = "COMPLETED";
    } else if (gradedProblemsCount > 0) {
        status = "IN_PROGRESS";
    }

    return { status, totalScore };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SupabaseClient } from "@supabase/supabase-js";
import {
    GradeSubmission,
    gradeSubmissionSchema,
    ParticipantGrading,
    TeamGrading,
} from "@/lib/schema/grading";
import { z } from "zod";

import { computeRoundScore, detectConflicts } from "@/lib/services/grading";

async function calculateRoundScore(
    supabase: SupabaseClient,
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
    const { status, totalScore } = computeRoundScore(
        roundProblems || [],
        allGrades || [],
        isGuts || false
    );

    const { error: upsertError } = await supabase.from(scoreTable).upsert(
        {
            [foreignKey]: participantId,
            round_id: roundId,
            score: totalScore,
            status: status,
        },
        { onConflict: `${foreignKey}, round_id` }
    );

    if (upsertError) {
        console.error("Failed to upsert score:", upsertError);
    }

    return { status, totalScore };
}

export async function submitGrades(
    rawSubmissions: GradeSubmission[], // Now a correctly inferred type from Zod
    confirm: boolean = false
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // Validate incoming data
    const parseResult = z
        .array(gradeSubmissionSchema)
        .safeParse(rawSubmissions);
    if (!parseResult.success) {
        return { error: "Invalid submission format" };
    }
    const submissions = parseResult.data;

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

            const conflicts = detectConflicts(
                submissions,
                existingData || [],
                problems || []
            );

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
        const { status, totalScore } = await calculateRoundScore(
            supabase,
            roundId,
            participantId,
            type
        );

        revalidatePath(`/staff/grading/${roundId}`);
        return { success: true, status, score: totalScore };
    } catch (e) {
        console.error(e);
        return { error: "Server error" };
    }
}

export async function resetGrades(
    participantId: number,
    roundId: number,
    type: "participant" | "team"
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const table =
        type === "participant" ? "participant_grading" : "team_grading";
    const scoreTable =
        type === "participant" ? "participant_score" : "team_score";
    const foreignKey = type === "participant" ? "participant_id" : "team_id";

    try {
        // 1. Fetch round problems to know what to delete
        const { data: roundProblems } = await supabase
            .from("problem")
            .select("id")
            .eq("round_id", roundId);

        if (roundProblems && roundProblems.length > 0) {
            const problemIds = roundProblems.map((p) => p.id);

            // 2. Delete grades
            const { error: gradeError } = await supabase
                .from(table)
                .delete()
                .eq(foreignKey, participantId)
                .in("problem_id", problemIds);

            if (gradeError) {
                console.error("Failed to delete grades:", gradeError);
                return { error: "Failed to reset grades" };
            }
        }

        // 3. Delete score
        const { error: scoreError } = await supabase
            .from(scoreTable)
            .delete()
            .eq(foreignKey, participantId)
            .eq("round_id", roundId);

        if (scoreError) {
            console.error("Failed to delete score:", scoreError);
            return { error: "Failed to reset score" };
        }

        revalidatePath(`/staff/grading/${roundId}`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Server error" };
    }
}

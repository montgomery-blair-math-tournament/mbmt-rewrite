"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GradeSubmission, gradeSubmissionSchema } from "@/lib/schema/grading";
import { z } from "zod";

import { computeRoundScore, detectConflicts } from "@/lib/services/grading";

async function calculateRoundScore(
    roundId: number,
    participantOrTeamId: number,
    type: "participant" | "team"
) {
    const supabase = await createClient();
    const table = `${type}_grading`;
    const scoreTable = `${type}_score`;
    const foreignKey = `${type}_id`;

    const { data: round } = await supabase
        .from("round")
        .select("*")
        .eq("id", roundId)
        .limit(1)
        .single();
    const isGuts = round?.type?.toLowerCase().includes("guts");

    const { data: roundProblems } = await supabase
        .from("problem")
        .select("*")
        .eq("round_id", roundId);

    const { data: allGrades } = await supabase
        .from(table)
        .select("*")
        .eq(foreignKey, participantOrTeamId);

    const { status, totalScore } = computeRoundScore(
        roundProblems || [],
        allGrades || [],
        isGuts || false
    );

    const { error: upsertError } = await supabase.from(scoreTable).upsert(
        {
            [foreignKey]: participantOrTeamId,
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
    rawSubmissions: GradeSubmission[],
    confirm: boolean = false
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

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
    const roundId = submissions[0].round_id;

    const table =
        type === "participant" ? "participant_grading" : "team_grading";
    const foreignKey = type === "participant" ? "participant_id" : "team_id";

    try {
        if (!confirm) {
            const problemIds = submissions.map((s) => s.problem_id);
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

        const inserts = submissions.map((s) => {
            let answer = s.answer;
            if (answer) answer = answer.trim();
            return {
                [foreignKey]: s.id,
                problem_id: s.problem_id,
                grader_id: user.id,
                answer: answer,
                is_correct: s.is_correct,
                is_force: s.is_force || false,
            };
        });

        const { error } = await supabase.from(table).insert(inserts);
        if (error) {
            console.error("Submission error:", error);
            return { error: "Failed to submit grades" };
        }

        const { status, totalScore } = await calculateRoundScore(
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
        const { data: roundProblems } = await supabase
            .from("problem")
            .select("id")
            .eq("round_id", roundId);

        if (roundProblems && roundProblems.length > 0) {
            const problemIds = roundProblems.map((p) => p.id);

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

export async function addParticipantOrTeamToRound(
    fullId: string,
    roundId: number,
    type: "participant" | "team"
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const upperId = fullId.trim().toUpperCase();
    const numMatch = upperId.match(/\d+$/);

    if (!numMatch) {
        return { error: "Invalid ID format" };
    }

    const idNum = parseInt(numMatch[0]);

    if (type === "team") {
        const { data: team, error: teamError } = await supabase
            .from("team")
            .select("id, division")
            .eq("id", idNum)
            .single();

        if (teamError || !team) {
            return { error: "Team not found" };
        }

        const { DIVISIONS } = await import("@/lib/constants/settings");
        const divisionInfo = DIVISIONS[team.division ?? 0] || DIVISIONS[0];
        const expectedId = `T${divisionInfo.prefix}${team.id}`.toUpperCase();

        if (upperId !== expectedId) {
            return {
                error: `Invalid team ID. Expected prefix for division: ${expectedId.replace(/[0-9]/g, "")}`,
            };
        }

        const { error: insertError } = await supabase
            .from("team_round")
            .insert({ team_id: idNum, round_id: roundId });

        if (insertError && insertError.code !== "23505") {
            console.error(insertError);
            return { error: "Failed to add to round" };
        }
    } else {
        const { data: participantData, error: participantError } =
            await supabase
                .from("participant")
                .select("id, team_id")
                .eq("id", idNum)
                .single();

        if (participantError || !participantData) {
            return { error: "Participant not found" };
        }

        let divisionCode = 0;
        if (participantData.team_id) {
            const { data: teamData } = await supabase
                .from("team")
                .select("division")
                .eq("id", participantData.team_id)
                .single();
            if (teamData) {
                divisionCode = teamData.division ?? 0;
            }
        }

        const { DIVISIONS } = await import("@/lib/constants/settings");
        const divisionInfo = DIVISIONS[divisionCode] || DIVISIONS[0];
        const expectedId =
            `${divisionInfo.prefix}${participantData.id}`.toUpperCase();

        if (upperId !== expectedId) {
            return {
                error: `Invalid participant ID. Expected prefix for division: ${expectedId.replace(/[0-9]/g, "")}`,
            };
        }

        const { error: insertError } = await supabase
            .from("participant_round")
            .insert({ participant_id: idNum, round_id: roundId });

        if (insertError && insertError.code !== "23505") {
            console.error(insertError);
            return { error: "Failed to add to round" };
        }
    }

    revalidatePath(`/staff/grading/${roundId}`);
    return { success: true };
}

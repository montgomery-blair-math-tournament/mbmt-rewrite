"use server";

import { GradeSubmission, ParticipantGrading } from "@/lib/schema/grading";
import { createClient } from "@/lib/supabase/server";
import { Problem } from "@/lib/schema/problem";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { Participant } from "../schema/participant";

// Calculates the weights for all problems in an individual round, returning the number of problems updated
export async function calculateIndividualProblemWeightsByRound(
    roundId: number
): Promise<number> {
    const supabase = await createClient();
    const { error, status } = await checkUserPerms();

    if (error || status !== "success") {
        console.error(
            `Unauthorized access attempt to calculateIndividualProblemWeightsByRound: ${error}`
        );
        toast.error("Unauthorized");
        redirect("/staff/rounds");
    }

    // Fetch the individual rounds
    const { data: problemsData } = await supabase
        .from("problem")
        .select("*, round:round_id (id, type)")
        .eq("round.type", "individual")
        .eq("round_id", roundId);

    const problems = problemsData as Problem[];

    const weights = await Promise.all(
        problems.map(async (problem) => ({
            problem,
            weight: await calculateIndividualProblemWeight({ problem }),
        }))
    );

    return addIndividualWeightsToDB({ weights });
}

// Calculates the weight for an individual problem, returning its weight (number)
async function calculateIndividualProblemWeight({
    problem,
}: {
    problem: Problem;
}): Promise<number> {
    const supabase = await createClient();
    const { data: gradingData } = await supabase
        .from("participant_grading")
        .select("*")
        .eq("problem_id", problem.id);

    const participantsCorrect: number[] = [];
    const participantsSeen: number[] = [];

    if (!gradingData) {
        throw new Error(
            `Could not fetch grading data for problem ${problem.number}`
        );
    }

    console.log(gradingData);

    const grades: (GradeSubmission & { participant_id: number })[] = (
        gradingData as ParticipantGrading[]
    ).map((grade) => ({
        type: "participant",
        id: grade.id,
        round_id: problem.round_id,
        problem_id: problem.id,
        answer: grade.answer,
        is_correct: grade.is_correct,
        is_force: grade.is_force,
        participant_id: grade.participant_id,
    }));

    grades.forEach((grade) => {
        // only count the first submission per participant unless forced
        if (!participantsSeen.includes(grade.participant_id)) {
            // first time seeing a grade for this participant
            participantsSeen.push(grade.participant_id);
            if (grade.is_correct) {
                participantsCorrect.push(grade.participant_id);
            }
        } else if (
            participantsSeen.includes(grade.participant_id) &&
            grade.is_force
        ) {
            // force update
            if (participantsCorrect.includes(grade.participant_id)) {
                participantsCorrect.splice(
                    participantsCorrect.indexOf(grade.participant_id),
                    1
                );
            }
        }
    });

    const N = participantsSeen.length;
    const n = participantsCorrect.length;

    return 2 + Math.log((N + 2) / (n + 2));
}

// Given a list of problems and their weights, updates the problem weights in the database and returns the number of problems updated
async function addIndividualWeightsToDB({
    weights: problemWeights,
}: {
    weights: { problem: Problem; weight: number }[];
}) {
    const supabase = await createClient();

    let count = 0;

    await Promise.all(
        problemWeights.map(async ({ problem, weight }) => {
            await supabase
                .from("problem")
                .update({ weight })
                .eq("id", problem.id);
            count++;
        })
    );

    return count;
}

// Calcluates the individual scores for all participants in a round, returning the number of participants updated
export async function calculateIndividualScoresByRound(
    roundId: number
): Promise<number> {
    const { error, status } = await checkUserPerms();
    if (error || status !== "success") {
        console.error(
            `Unauthorized access attempt to calculateIndividualScoresByRound: ${error}`
        );
        return -1;
    }

    const supabase = await createClient();

    const { data: problemWeightsData } = await supabase
        .from("problem")
        .select("id, weight")
        .eq("round_id", roundId);
    const problemWeights = problemWeightsData as Pick<
        Problem,
        "id" | "weight"
    >[];

    const { data: participantIdsData } = await supabase
        .from("participant_round")
        .select("*")
        .eq("round_id", roundId);
    const participantIds = participantIdsData as { id: number }[];
    const participants: Participant[] = await Promise.all(
        participantIds.map(async (pId) => {
            const { data: participantData } = await supabase
                .from("participant")
                .select("*")
                .eq("id", pId.id)
                .limit(1)
                .single();

            return participantData as Participant;
        })
    );

    return 0;
}

// Calculates the normalized score for all participants in a round, returning the number of participants updated
export async function calculateNormalizedScoresByRound({
    roundId,
}: {
    roundId: number;
}): Promise<number> {
    const { error, status } = await checkUserPerms();
    if (error || status !== "success") {
        console.error(
            `Unauthorized access attempt to calculateNormalizedScoresByRound: ${error}`
        );
        return -1;
    }

    return 0;
}

async function checkUserPerms() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/staff/login");
    }

    const { data: roleData } = await supabase
        .from("user")
        .select("role")
        .eq("id", user.id)
        .limit(1)
        .single();

    if (!roleData || !roleData.role || roleData.role !== "admin") {
        return { error: "Unauthorized", status: "failure" };
    }

    return { error: null, status: "success" };
}

"use server";

import { GradeSubmission, ParticipantGrading } from "@/lib/schema/grading";
import { createClient } from "@/lib/supabase/server";
import { Problem } from "@/lib/schema/problem";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { Round } from "../schema/round";
import { Participant } from "../schema/participant";
import { ParticipantScore } from "../schema/score";

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

// Calculates the weight for an individual problem
// Returns its weight
async function calculateIndividualProblemWeight({
    problem,
}: {
    problem: Problem;
}): Promise<number> {
    const { participantsSeen, participantsCorrect } =
        await getParticipantIdsForProblem(problem);

    const N = participantsSeen.length;
    const n = participantsCorrect.length;

    return 2 + Math.log((N + 2) / (n + 2));
}

// Fetches the participant IDs for a given problem
// Returns the ids of participants who have seen the problem and those who have answered it correctly
async function getParticipantIdsForProblem(
    problem: Problem
): Promise<{ participantsSeen: number[]; participantsCorrect: number[] }> {
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

    if (gradingData.length === 0) {
        console.warn(
            `Attempted to calculate weight for problem ${problem.number} with no grading data`
        );
    }

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

    return { participantsSeen, participantsCorrect };
}

// Given a list of problems and their weights, updates the problem weights in the database
// Returns the number of problems updated
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

export async function calculateIndividualScoresOverall(): Promise<
    Map<number, number>
> {
    const supabase = await createClient();
    const { error, status } = await checkUserPerms();
    if (error || status !== "success") {
        console.error(
            `Unauthorized access attempt to calculateIndividualScoresOverall: ${error}`
        );
    }

    // Fetch all participants
    const { data: participantData } = await supabase
        .from("participant")
        .select("*");

    const participants = participantData as Participant[];
    const participantScoresMap: Map<number, number> = new Map();
    const dbParticipantScoresMap: Map<Participant, number> = new Map();
    await Promise.all(
        participants.map(async (participant) => {
            const { data: participantScoreData } = await supabase
                .from("participant_score")
                .select("*")
                .eq("participant_id", participant.id);
            const participantScores =
                participantScoreData as ParticipantScore[];

            if (!participantScores || participantScores.length === 0) {
                console.warn(
                    `Could not fetch scores for participant ${participant.first_name} ${participant.last_name}`
                );
                return;
            }

            let totalNormalizedScore = 0;
            participantScores.forEach(
                (score) => (totalNormalizedScore += score.normalized_score ?? 0)
            );
            participantScoresMap.set(participant.id, totalNormalizedScore);
            dbParticipantScoresMap.set(participant, totalNormalizedScore);
        })
    );

    await addIndividualScoresOverallToDB({
        scores: dbParticipantScoresMap,
    });
    return participantScoresMap;
}

async function addIndividualScoresOverallToDB({
    scores,
}: {
    scores: Map<Participant, number>;
}) {
    const supabase = await createClient();

    const individualScoresMap: Map<Participant, number> = new Map();
    await Promise.all(
        scores.entries().map(async (score) => {
            const participant = score[0];
            if (participant) {
                individualScoresMap.set(
                    participant,
                    individualScoresMap.get(participant) ?? 0 + score[1]
                );
            }
        })
    );

    await Promise.all(
        individualScoresMap.entries().map(async (score) => {
            const { error } = await supabase
                .from("participant")
                .update({ score: score[1] })
                .eq("id", score[0].id);
            if (error) {
                console.error(
                    `Error updating score for participant ${score[0].id}: ${error.message}`
                );
            }
        })
    );
}

// Calculates the normalized score for all participants in a round
// Returns the number of participants updated
export async function calculateNormalizedScoresByRound({
    roundId,
}: {
    roundId: number;
}): Promise<Map<number, number>> {
    const { error, status } = await checkUserPerms();
    if (error || status !== "success") {
        console.error(
            `Unauthorized access attempt to calculateNormalizedScoresByRound: ${error}`
        );
        return new Map();
    }

    const supabase = await createClient();

    // Fetch the round given the roundId
    const { data: roundData } = await supabase
        .from("round")
        .select("*")
        .eq("id", roundId)
        .limit(1)
        .single();
    const round = roundData as Round;

    // Fetch the max scores for the round
    const { data: problemsData } = await supabase
        .from("problem")
        .select("*")
        .eq("round_id", round.id);
    const problems = problemsData as Problem[];

    // Map the problem IDs to their weights
    const problemWeights = problems.map((problem) => ({
        id: problem.id,
        weight: problem.weight,
    }));
    const problemWeightsMap: Map<number, number> = new Map();
    problemWeights.forEach((problem) => {
        problemWeightsMap.set(problem.id, problem.weight);
    });

    // Map the participants to their rounds
    const { data: participantRoundData } = await supabase
        .from("participant_round")
        .select("*, round:round_id(*)")
        .eq("round_id", round.id);
    const participantRounds = participantRoundData as {
        participant_id: number;
        round_id: number;
        round: Round;
    }[];
    const participantScoresMap: Map<number, number> = new Map();

    await Promise.all(
        problems.map(async (problem) => {
            const { participantsCorrect } =
                await getParticipantIdsForProblem(problem);

            participantRounds.forEach((participantRound) => {
                // If the participant got the problem correct, add the weight of the problem to their score
                if (
                    participantsCorrect.includes(
                        participantRound.participant_id
                    )
                ) {
                    participantScoresMap.set(
                        participantRound.participant_id,
                        (participantScoresMap.get(
                            participantRound.participant_id
                        ) ?? 0) + (problemWeightsMap.get(problem.id) ?? 0)
                    );
                }
            });
        })
    );

    const maxScore = Math.max(...participantScoresMap.values());

    // Normalize the scores by dividing each participant's score by the max score
    participantScoresMap.forEach((score, participantId) => {
        participantScoresMap.set(participantId, score / maxScore);
    });

    await addNormalizedScoresToDB({
        scores: participantScoresMap,
        roundId: roundId,
    });
    return participantScoresMap;
}

async function addNormalizedScoresToDB({
    roundId,
    scores,
}: {
    roundId: number;
    scores: Map<number, number>;
}) {
    const supabase = await createClient();

    const normalizedScores = await Promise.all(
        scores.entries().map(async (score) => ({
            round_id: roundId,
            participant_id: score[0],
            normalized_score: score[1],
        }))
    );

    const { error: upsertError } = await supabase
        .from("participant_score")
        .upsert(normalizedScores);

    if (upsertError) {
        throw upsertError;
    }
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

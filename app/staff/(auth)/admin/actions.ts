"use server";

import { GradeSubmission, ParticipantGrading } from "@/lib/schema/grading";
import { createClient } from "@/lib/supabase/server";
import { Problem } from "@/lib/schema/problem";
import { Participant } from "@/lib/schema/participant";

// Returns the number of problems that updated their weights
export async function calculateIndividualProblemWeights(): Promise<number> {
    const supabase = await createClient();

    // Fetch the individual rounds
    const { data: problemsData } = await supabase
        .from("problem")
        .select("*, round:round_id (id, type)")
        .eq("round.type", "individual");

    const problems = problemsData as Problem[];

    const weights = await Promise.all(
        problems.map((problem) => calculateProblemWeight({ problem }))
    );

    return addWeightsToDB({ weights });
}

async function calculateProblemWeight({
    problem,
}: {
    problem: Problem;
}): Promise<{ problem: Problem; weight: number }> {
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

    const grades: (GradeSubmission & { participantId: number })[] = (
        gradingData as ParticipantGrading[]
    ).map((grade) => ({
        type: "participant" as const,
        id: grade.id,
        round_id: problem.round_id,
        problem_id: problem.id,
        answer: grade.answer,
        is_correct: grade.is_correct,
        is_force: grade.is_force,
        participantId: grade.participant_id,
    }));

    grades.forEach((grade) => {
        // only count the first submission per participant unless forced
        if (!participantsSeen.includes(grade.participantId)) {
            participantsSeen.push(grade.participantId);
            if (grade.is_correct) {
                participantsCorrect.push(grade.participantId);
            }
        } else if (
            participantsSeen.includes(grade.participantId) &&
            grade.is_force
        ) {
            if (participantsCorrect.includes(grade.participantId)) {
                participantsCorrect.splice(
                    participantsCorrect.indexOf(grade.participantId)
                );
            }
        }
    });

    const N = participantsSeen.length;
    const n = participantsCorrect.length;

    return { problem, weight: 2 + Math.log((N + 2) / (n + 2)) };
}

async function addWeightsToDB({
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
                .update({ weight: weight })
                .eq("id", problem.id);
            count++;
        })
    );

    return count;
}

export async function calculateIndividualScores(): Promise<number> {
    const supabase = await createClient();

    const { data: participantsData, error: participantsError } = await supabase
        .from("participant")
        .select("id");
    if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        return 0;
    }
    const participants = participantsData as Pick<Participant, "id">[];

    const { data: problemsData, error: problemsError } = await supabase
        .from("problem")
        .select("*");
    if (problemsError) {
        console.error("Error fetching problems:", problemsError);
        return 0;
    }
    const problems = problemsData as Problem[];

    const participantRawScores = new Map<number, number>();

    for (const participant of participants) {
        let rawScore = 0;
        for (const problem of problems) {
            // Check if participant is correct for this problem
            const isCorrect = await checkIfParticipantCorrect();

            if (isCorrect) {
                // Add points multiplied by weight for correct problems
                rawScore += (problem.points ?? 0) * (problem.weight ?? 0);
            }
        }
        participantRawScores.set(participant.id, rawScore);
    }

    // TODO: Normalize scores and stuff
    return -1;
}

async function checkIfParticipantCorrect(): Promise<boolean> {
    // TODO
    return false;
}

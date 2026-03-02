"use server";

import { GradeSubmission, ParticipantGrading } from "@/lib/schema/grading";
import { createClient } from "@/lib/supabase/server";
import { Problem } from "@/lib/schema/problem";

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
        roundId: problem.round_id,
        problemId: problem.id,
        answer: grade.answer,
        isCorrect: grade.is_correct,
        isForce: grade.is_force,
        participantId: grade.participant_id,
    }));

    grades.forEach((grade) => {
        // only count the first submission per participant unless forced
        if (!participantsSeen.includes(grade.participantId)) {
            participantsSeen.push(grade.participantId);
            if (grade.isCorrect) {
                participantsCorrect.push(grade.participantId);
            }
        } else if (
            participantsSeen.includes(grade.participantId) &&
            grade.isForce
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
    return 3;
}

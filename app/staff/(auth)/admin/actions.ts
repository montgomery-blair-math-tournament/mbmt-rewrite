"use server";

import { GradeSubmission, ParticipantGrading } from "@/lib/schema/grading";
import { createClient } from "@/lib/supabase/server";
import { Problem } from "@/lib/schema/problem";
import { Round } from "@/lib/schema/round";
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

async function getProblemWeights() {
    const supabase = await createClient();
    const { data: weightData } = await supabase
        .from("problem")
        .select("*")
        .not("weight", "is", null);
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

    const { data: participantGradingData, error: gradingError } = await supabase
        .from("participant_grading")
        .select("*");
    if (gradingError) {
        console.error("Error fetching participant grading:", gradingError);
        return 0;
    }
    const participantGrading = participantGradingData as ParticipantGrading[];

    const participantRawScores = new Map<number, number>();

    for (const participant of participants) {
        let rawScore = 0;
        for (const problem of problems) {
            // Check if participant is correct for this problem
            const isCorrect = await checkIfParticipantCorrect({
                participantId: participant.id,
                problemId: problem.id,
                gradingData: participantGrading,
            });

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

async function checkIfParticipantCorrect({
    participantId,
    problemId,
    gradingData,
}: {
    participantId: number;
    problemId: number;
    gradingData: ParticipantGrading[];
}): Promise<boolean> {
    const participantProblemGrades = gradingData.filter(
        (grade) =>
            grade.participant_id === participantId &&
            grade.problem_id === problemId
    );

    if (participantProblemGrades.length === 0) {
        return false;
    }

    // Sort by created_at to get the chronological order of submissions
    participantProblemGrades.sort(
        (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let finalIsCorrect: boolean | null = null;
    let hasForcedSubmission = false;

    for (const grade of participantProblemGrades) {
        if (grade.is_force) {
            finalIsCorrect = grade.is_correct;
            hasForcedSubmission = true;
            // If a forced grade is encountered, it overrides everything before it
            // and we can stop looking for further forced grades in this context
        } else if (!hasForcedSubmission) {
            // If no forced submission has been encountered yet, consider the unforced grade
            // The first unforced grade sets the initial correctness, subsequent unforced
            // grades are ignored unless a forced grade overrides it.
            if (finalIsCorrect === null) {
                finalIsCorrect = grade.is_correct;
            }
        }
    }

    return finalIsCorrect ?? false;
}

async function calculateRoundWeightSums(): Promise<Map<Round, number>[]> {
    const supabase = await createClient();
    const { data: roundsData } = await supabase.from("round").select("*");
    const rounds = await Promise.all(
        (roundsData as Round[]).map(async (round) => {
            const { data: problemsData } = await supabase
                .from("problem")
                .select("*")
                .eq("round_id", round.id);

            let weightSum = 0;
            (problemsData as Problem[]).map(
                (problem) => (weightSum += problem.weight ?? 0)
            );

            const map = new Map<Round, number>();
            map.set(round, weightSum);
            return map;
        })
    );
    return rounds;
}

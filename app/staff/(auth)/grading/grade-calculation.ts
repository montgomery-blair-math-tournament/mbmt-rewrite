"use server";

import { GradeSubmission, gradeSubmissionSchema } from "@/lib/schema/grading";
import { Problem } from "@/lib/schema/problem";
import { Round } from "@/lib/schema/round";
import { createClient } from "@/lib/supabase/server";
import { getAllGrades } from "./[id]/grading-data";
import { Participant } from "@/lib/schema/participant";

export async function calculateIndividualScores() {
    const supabase = await createClient();
    // Calculate the problem weights for each round
    const { data: roundsData } = await supabase
        .from("round")
        .select("*")
        .eq("type", "individual");

    (roundsData as Round[]).map((round) => calculateProblemWeights(round));
    // For each participant, count the number of questions they answered correctly and sum the weights

    // For each participant, calculate the individual score by using the formula in the scoring doc
}

async function calculateProblemWeights(round: Round) {
    const supabase = await createClient();

    const { data: problemsData } = await supabase
        .from("problem")
        .select("*")
        .eq("round_id", round.id);

    (problemsData as Problem[]).map((problem) =>
        calculateProblemWeight(problem)
    );
}

async function calculateProblemWeight(problem: Problem) {
    const supabase = await createClient();
    const { data: gradingData } = await supabase
        .from("participant_grading")
        .select("*")
        .eq("problem_id", problem.id)
        .order("is_force", { ascending: true });

    // <participantId, whether they solved the problem or not>
    const participants: Record<number, boolean> = {};

    (gradingData as GradeSubmission[]).map((grade) => {
        if (participants[grade.id]) {
        }
    });

    console.log(participants);
}

"use server";

import { GradeSubmission } from "@/lib/schema/grading";
import { Problem } from "@/lib/schema/problem";
import { Round } from "@/lib/schema/round";
import { createClient } from "@/lib/supabase/server";
import { getAllGrades } from "./[id]/grading-data";
import { Participant } from "@/lib/schema/participant";

export async function calculateIndividualScores() {
    calculateProblemWeights();
}

async function calculateProblemWeights() {
    const supabase = await createClient();
    const { data: roundsData } = await supabase
        .from("round")
        .select("*")
        .eq("type", "individual");

    // console.log(roundsData as Round[]);

    calculateProblemWeight(2);
}

async function calculateProblemWeight(problemId: number) {
    const supabase = await createClient();
    const { data: gradingData } = await supabase
        .from("participant_grading")
        .select("*")
        .eq("problem_id", problemId)
        .order("is_force", { ascending: true });

    const participants: Record<number, boolean>[] = [];

    console.log(participants);
}

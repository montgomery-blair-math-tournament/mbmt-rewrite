"use server";

import { createClient } from "@/lib/supabase/server";

async function calculateGrades() {}

async function calculateProblemWeights() {
    const supabase = await createClient();
}

async function calculateProblemWeight(problemId: number) {
    const supabase = await createClient();

    const { data: problems } = await supabase
        .from("participant_grading")
        .select()
        .eq("problem_id", problemId);
}

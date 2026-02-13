"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Round } from "@/lib/schema/round";
import { Problem } from "@/lib/schema/problem";

export async function updateRound(id: number, data: Partial<Round>) {
    const supabase = await createClient();

    const { error } = await supabase.from("round").update(data).eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/staff/rounds/${id}`);
    revalidatePath("/staff/rounds");
}

export async function upsertProblem(data: Partial<Problem>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("problem")
        .upsert(data)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    if (data.round_id) {
        revalidatePath(`/staff/rounds/${data.round_id}`);
    }
}

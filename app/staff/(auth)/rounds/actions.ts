"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createRound(data: {
    name: string;
    division: number;
    type: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase.from("round").insert(data);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/staff/rounds");
}

export async function deleteRound(id: number) {
    const supabase = await createClient();

    const { error } = await supabase.from("round").delete().eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/staff/rounds");
    redirect("/staff/rounds");
}

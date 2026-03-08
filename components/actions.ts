"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function checkInParticipant({ id }: { id: number }) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("participant")
        .update({ checked_in: true })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/staff/participants");
}

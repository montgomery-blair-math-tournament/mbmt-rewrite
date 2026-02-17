"use server";

import { createClient } from "@/lib/supabase/server";

export async function addAnnouncement({
    author,
    message,
    expiresAt,
}: {
    author: string;
    message: string;
    expiresAt?: Date | number | null;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: roleData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user?.id)
        .limit(1)
        .single();

    if (user && roleData) {
        if (roleData.role === "admin") {
            await supabase
                .from("announcements")
                .insert({ author, message, expiresAt });
        } else {
        }
    }
}

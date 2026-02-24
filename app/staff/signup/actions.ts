"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUp({
    email,
    password,
    firstName,
    lastName,
}: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}) {
    const supabase = await createClient();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
        {
            email,
            password,
            options: {
                data: {
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                },
            },
        }
    );

    console.log(signUpData);

    if (
        signUpData.user?.id &&
        firstName.trim().length > 0 &&
        lastName.trim().length > 0
    ) {
        await supabase.from("user").insert(
            {
                id: signUpData.user.id,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                role: "staff",
            }
            // { onConflict: "id", ignoreDuplicates: true }
        );
    }

    return { error: signUpError };
}

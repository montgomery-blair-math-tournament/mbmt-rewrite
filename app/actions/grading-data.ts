"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyGrades(
    type: "participant" | "team",
    id: number,
    roundId: number
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const table =
        type === "participant" ? "participant_grading" : "team_grading";
    const foreignKey = type === "participant" ? "participant_id" : "team_id";

    // We want the LATEST grade for each problem by this user
    // But since we are doing append-only, we just fetch all and maybe dedup in JS?
    // Or just fetch the most recent one for each problem?
    // Postgres distinct on problem_id order by created_at desc?

    const { data } = await supabase
        .from(table)
        .select("*")
        .eq(foreignKey, id)
        .eq("grader_id", user.id)
        .order("created_at", { ascending: false });

    // Dedup to get latest per problem
    const latestMap = new Map();
    data?.forEach((d) => {
        if (!latestMap.has(d.problem_id)) {
            latestMap.set(d.problem_id, d);
        }
    });

    return Array.from(latestMap.values());
}

export async function getAllGrades(
    type: "participant" | "team",
    id: number,
    roundId: number
) {
    const supabase = await createClient();

    // We need grader info (username, role)
    // Assuming profiles table or similar? Or just auth metadata?
    // Usually via joined query if relation exists.
    // Schema in grading.ts shows grader_id is uuid.
    // We assume there's a relation to 'user_roles' or 'profiles' referenced as 'grader_id' if foreign key exists.
    // If not, we might fail to get names.
    // User request implies "graderName" is available.
    // In ConflictResolutionModal: g.grader_id?.username
    // This suggests the relation name is 'grader_id' (which is odd for a join, usually 'grader') or the column is grader_id and relation is something else.
    // Let's guess the relation is 'grader:grader_id(...)'.

    const table =
        type === "participant" ? "participant_grading" : "team_grading";
    const foreignKey = type === "participant" ? "participant_id" : "team_id";

    const { data, error } = await supabase
        .from(table)
        .select(
            `
            *,
            grader:grader_id (
                username,
                role
            )
        `
        )
        .eq(foreignKey, id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching all grades:", error);
        return [];
    }

    // We might have multiple entries per grader per problem.
    // We probably only care about their *latest* entry for conflict resolution?
    // We will return all and let frontend/logic filter.
    // But usually conflict is against the "current state" of the grade.

    // Flatten the grader info to match expected structure if needed,
    // or let frontend handle 'grader.username'.
    // The Modal expects `grader_id?.username` which implies `grader_id` IS the object in the response?
    // Supabase returns relation object on the column name if we alias it or verify relation name.
    // I'll leave it as `grader` and frontend might need adjustment or alias in select.
    // "grader:grader_id" means the property will be called 'grader'.
    // The frontend code `g.grader_id?.username` suggests the property is `grader_id`.
    // So I should alias it: `grader_id:grader_id(...)` is not valid since grader_id is the FK column.
    // Actually, if the relation is defined on grader_id, Supabase uses the table name or relation name.
    // Let's try to fetch `grader_id` (uuid) AND `grader:grader_id(...)` (object).

    return data || [];
}

export async function getGradingStatus(
    type: "participant" | "team",
    id: number,
    roundId: number
) {
    const supabase = await createClient();

    const table =
        type === "participant" ? "participant_grading" : "team_grading";
    const foreignKey = type === "participant" ? "participant_id" : "team_id";

    // Fetch relevant columns only: problem_id and grader info
    const { data, error } = await supabase
        .from(table)
        .select(
            `
            problem_id,
            problem_id,
            grader_id,
            grader:grader_id (
                username
            )
        `
        )
        .eq(foreignKey, id);

    if (error) {
        console.error("Error fetching grading status:", error);
        return {};
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Group by problem_id -> string[] (grader names)
    const statusMap: Record<number, string[]> = {};
    const hasGradedMap: Record<number, boolean> = {};

    data?.forEach((row: any) => {
        const pId = row.problem_id;
        const name = row.grader?.username || "Unknown";
        const graderId = row.grader_id;

        if (!statusMap[pId]) {
            statusMap[pId] = [];
            hasGradedMap[pId] = false;
        }

        if (!statusMap[pId].includes(name)) {
            statusMap[pId].push(name);
        }

        if (user && graderId === user.id) {
            hasGradedMap[pId] = true;
        }
    });

    return { statusMap, hasGradedMap };
}

"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyGrades(type: "participant" | "team", id: number) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const table =
        type === "participant" ? "participant_grading" : "team_grading";
    const foreignKey = type === "participant" ? "participant_id" : "team_id";

    const { data } = await supabase
        .from(table)
        .select("*")
        .eq(foreignKey, id)
        .eq("grader_id", user.id)
        .order("created_at", { ascending: false });

    const latestMap = new Map();
    data?.forEach((d) => {
        if (!latestMap.has(d.problem_id)) {
            latestMap.set(d.problem_id, d);
        }
    });

    return Array.from(latestMap.values());
}

export async function getAllGrades(type: "participant" | "team", id: number) {
    const supabase = await createClient();

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

    return data || [];
}

export async function getGradingStatus(
    type: "participant" | "team",
    id: number
) {
    const supabase = await createClient();
    const table = `${type}_grading`;
    const foreignKey = `${type}_id`;

    const { data: graderData, error } = await supabase
        .from(table)
        .select(
            `
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
        return { statusMap: {}, hasGradedMap: {} };
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const statusMap: Record<number, string[]> = {};
    const hasGradedMap: Record<number, boolean> = {};

    graderData?.forEach(
        (row: {
            problem_id: number;
            grader_id: string;
            grader: { username: string }[] | { username: string } | null;
        }) => {
            console.log(row);
            const problemId = row.problem_id;
            const graderObj = Array.isArray(row.grader)
                ? row.grader[0]
                : row.grader;
            const name = graderObj?.username || "Unknown";
            const graderId = row.grader_id;

            if (!statusMap[problemId]) {
                statusMap[problemId] = [];
                hasGradedMap[problemId] = false;
            }

            if (!statusMap[problemId].includes(name)) {
                statusMap[problemId].push(name);
            }

            if (user && graderId === user.id) {
                hasGradedMap[problemId] = true;
            }
        }
    );

    return { statusMap, hasGradedMap };
}

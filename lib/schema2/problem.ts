import z from "zod";

export const PROBLEM_TABLE_NAME = "problem_v2";

export const betterProblem = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }),
    number: z.number(),
    round_id: z.number(),
    problem: z.string(),
    type: z.enum(["boolean", "numeric", "custom"]),
    answer: z.string(),
    points: z.number(),
    guts_section: z.number(),
    weight: z.number(),
});

export type BetterProblem = z.infer<typeof betterProblem>;

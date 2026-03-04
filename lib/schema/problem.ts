import { z } from "zod";

export const problemSchema = z.object({
    id: z.number(),
    round_id: z.number(),
    number: z.string(),
    problem: z.string(),
    answer: z.string(),
    type: z
        .enum(["standard", "custom", "boolean", "numeric"])
        .default("standard"),
    points: z.number().default(1),
    section: z.number().nullable(),
    weight: z.float64().nullable(),
});

export type Problem = z.infer<typeof problemSchema>;

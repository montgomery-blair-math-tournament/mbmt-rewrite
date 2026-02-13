import { z } from "zod";

export const problemSchema = z.object({
    id: z.number(),
    round_id: z.number(),
    number: z.string(),
    problem: z.string(),
    answer: z.string(),
    type: z.string(),
});

export type Problem = z.infer<typeof problemSchema>;

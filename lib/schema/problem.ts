import { z } from "zod";

export const problemSchema = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }).optional(),
    number: z.number(),
    round_id: z.number(),
    problem: z.string(),
    type: z.enum(["standard", "boolean", "numeric", "custom"]),
    answer: z.string(),
    points: z.number(),
    guts_section: z.number().nullable(),
    weight: z.number().default(0),
});

export type Problem = z.infer<typeof problemSchema>;

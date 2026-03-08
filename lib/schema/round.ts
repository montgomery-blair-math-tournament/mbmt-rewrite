import { z } from "zod";

export const roundSchema = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }).optional(),
    name: z.string(),
    type: z.enum(["individual", "team", "guts"]),
    division: z.number(),
    max_score: z.float64().default(0).nullable(),
});

export type Round = z.infer<typeof roundSchema>;

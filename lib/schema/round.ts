import { z } from "zod";

export const roundSchema = z.object({
    id: z.number(),
    name: z.string(),
    division: z.number(),
    type: z.string(),
});

export type Round = z.infer<typeof roundSchema>;

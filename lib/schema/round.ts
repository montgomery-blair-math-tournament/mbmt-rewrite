import { z } from "zod";

export const roundSchema = z.object({
    id: z.number(),
    name: z.string(),
    division: z.union([z.literal("A"), z.literal("J")]),
    type: z.union([
        z.literal("individual"),
        z.literal("team"),
        z.literal("guts"),
    ]),
});

export type RoundType = "individual" | "team" | "guts";

export type Round = z.infer<typeof roundSchema>;

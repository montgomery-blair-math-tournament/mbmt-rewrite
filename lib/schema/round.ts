import { z } from "zod";

export const roundSchema = z.object({
    id: z.number(),
    name: z.string(),
    division: z.number(),
    type: z.union([
        z.literal("team"),
        z.literal("guts"),
        z.literal("individual"),
    ]),
});

export type RoundType = "team" | "guts" | "individual";

export type Round = z.infer<typeof roundSchema>;

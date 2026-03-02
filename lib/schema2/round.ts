import z from "zod";

export const ROUND_TABLE_NAME = "round";

export const betterRound = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }),
    name: z.string(),
    type: z.string(), // we should switch to enum ["individual", "team", "guts"] later
    division: z.number(), // 0 or 1; we should switch to boolean or enum later
});

export type BetterRound = z.infer<typeof betterRound>;

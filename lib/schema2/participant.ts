import z from "zod";

export const PARTICIPANT_TABLE_NAME = "participant";

export const betterParticipant = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }),
    team_id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    grade: z.number(),
    checked_in: z.boolean(),
    tshirt: z.string(),
    code: z.string(),
});

export type BetterParticipant = z.infer<typeof betterParticipant>;

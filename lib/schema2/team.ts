import z from "zod";

export const TEAM_TABLE_NAME = "team";

export const betterTeam = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }),
    name: z.string(),
    division: z.number(),
    school: z.string(),
    chaperone: z.string().nullable(),
    chaperone_email: z.string().nullable(), // should switch to z.email later
    chaperone_phone: z.string().nullable(),
});

export type BetterTeam = z.infer<typeof betterTeam>;

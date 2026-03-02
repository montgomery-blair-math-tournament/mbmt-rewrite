import z from "zod";

export const USER_TABLE_NAME = "user";

export const betterUser = z.object({
    id: z.uuid(),
    created_at: z.iso.datetime({ offset: true }),
    username: z.string().nullable(),
    role: z.string(), // Should change to enum ["staff", "user"] later
    first_name: z.string(),
    last_name: z.string(),
});

export type BetterUser = z.infer<typeof betterUser>;

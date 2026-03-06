import z from "zod";

export const userSchema = z.object({
    id: z.uuid(),
    created_at: z.iso.datetime({ offset: true }).optional(),
    role: z.enum(["staff", "admin"]),
    first_name: z.string(),
    last_name: z.string(),
    username: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

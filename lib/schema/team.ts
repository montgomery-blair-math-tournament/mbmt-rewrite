import { z } from "zod";

export const teamSchema = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }).optional(),
    name: z.string(),
    division: z.number(),
    school: z.string(),
    chaperone: z.string().nullable(),
    chaperone_email: z.string().nullable(),
    chaperone_phone: z.string().nullable(),
});

export type Team = z.infer<typeof teamSchema>;

export type TeamWithCount = Team & {
    participant: { count: number }[];
};

export type TeamDisplay = Team & { size: number; displayId: string };

export type TeamDetail = Team & { displayId: string };

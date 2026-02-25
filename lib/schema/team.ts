import { z } from "zod";

export const teamSchema = z.object({
    id: z.number(),
    created_at: z.string(),
    name: z.string(),
    code: z.string(),
    division: z.union([z.literal("J"), z.literal("A")]),
    school: z.string(),
    chaperone: z.string().nullable(),
    chaperone_email: z.string().nullable(),
    chaperone_phone: z.string().nullable(),
});

export type Team = z.infer<typeof teamSchema>;

export type TeamWithCount = Team & {
    participant: { count: number }[];
};

export type TeamDisplay = {
    id: number;
    displayId: string;
    name: string;
    code: string;
    division: "J" | "A";
    school: string;
    chaperone: string | null;
    size: number;
};

export type TeamDetail = {
    id: number;
    code: string;
    name: string;
    school: string;
    division: "J" | "A";
    chaperone: string | null;
    chaperoneEmail: string | null;
    chaperonePhone: string | null;
    displayId: string;
};

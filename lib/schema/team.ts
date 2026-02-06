import { z } from "zod";

export const teamSchema = z.object({
    id: z.number(),
    created_at: z.string(),
    name: z.string(),
    division: z.number(),
    school: z.string(),
    chaperone: z.string().nullable(),
    chaperone_email: z.string().nullable(),
    chaperone_phone: z.string().nullable(),
});

// Type for the join query result (including participant count)
export type TeamWithCount = z.infer<typeof teamSchema> & {
    participant: { count: number }[];
};

// Type for the table display
export type TeamDisplay = {
    id: number;
    displayId: string;
    name: string;
    school: string;
    coach: string;
    division: string;
    size: number;
};

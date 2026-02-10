import { z } from "zod";

export const participantSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    grade: z.number(),
    team_id: z.number(),
    checked_in: z.boolean(),
    tshirt: z.string(),
});

// Type for the join query result
export type ParticipantWithTeam = z.infer<typeof participantSchema> & {
    team: {
        name: string;
        school: string;
        division: number; // 0 or 1
        chaperone: string;
    } | null;
};


// Type for the table display
export type ParticipantDisplay = {
    id: number;
    displayId: string; // The formatted ID (e.g. A123)
    firstName: string;
    lastName: string;
    division: string; // "Abel" or "Jacobi"
    grade: number;
    school: string;
    team: string;
    chaperone: string;
    checkedIn: boolean;
    teamId: number;
};
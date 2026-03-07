import { z } from "zod";
import { Round } from "./round";

export const participantSchema = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }).optional(),
    team_id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    grade: z.number(),
    checked_in: z.boolean(),
    tshirt: z.string(),
    score: z.float64().nullable(),
    normalized_score: z.float64().nullable(),
    is_flagged: z.boolean().default(false),
});

export type Participant = z.infer<typeof participantSchema>;

export type ParticipantWithTeam = Participant & {
    team: {
        name: string;
        school: string;
        division: number;
        chaperone: string;
    } | null;
};

export type ParticipantDisplay = {
    id: number;
    display_id: string;
    first_name: string;
    last_name: string;
    division: string;
    grade: number;
    school: string;
    team: string;
    chaperone: string;
    checked_in: boolean;
    team_id: number;
    display_team_id: string | null;
    is_flagged: boolean;
};

export type ParticipantDetail = ParticipantDisplay & {
    individualRounds: Round[];
    teamRounds: Round[];
};

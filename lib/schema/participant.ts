import { z } from "zod";
import { Round } from "./round";
import { Team } from "./team";

export const participantSchema = z.object({
    id: z.number(),
    team_id: z.number(),
    code: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    grade: z.number(),
    checked_in: z.boolean(),
    tshirt: z.string(),
});

export type Participant = z.infer<typeof participantSchema>;

export type ParticipantWithTeam = Participant & { team: Team };

export type ParticipantDisplay = {
    id: number;
    teamId: number;
    teamCode: string;
    code: string;
    firstName: string;
    lastName: string;
    division: "J" | "A";
    grade: number;
    school: string;
    team: string;
    chaperone: string;
    checkedIn: boolean;
};

export type ParticipantDetail = ParticipantDisplay & {
    individualRounds: Round[];
    teamRounds: Round[];
};

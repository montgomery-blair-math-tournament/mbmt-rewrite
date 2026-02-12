import { z } from "zod";
import { Round } from "./round";

export const participantSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  grade: z.number(),
  team_id: z.number(),
  checked_in: z.boolean(),
  tshirt: z.string(),
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
  displayId: string;
  firstName: string;
  lastName: string;
  division: string;
  grade: number;
  school: string;
  team: string;
  chaperone: string;
  checkedIn: boolean;
  teamId: number;
};

export type ParticipantDetail = ParticipantDisplay & {
  individualRounds: Round[];
  teamRounds: Round[];
};

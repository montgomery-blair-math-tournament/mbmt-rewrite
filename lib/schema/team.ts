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

export type Team = z.infer<typeof teamSchema>;

export type TeamWithCount = Team & {
  participant: { count: number }[];
};

export type TeamDisplay = {
  id: number;
  displayId: string;
  name: string;
  school: string;
  chaperone: string | null;
  division: string;
  size: number;
};

export type TeamDetail = {
  id: number;
  name: string;
  school: string;
  division: number;
  chaperone: string | null;
  chaperoneEmail: string | null;
  chaperonePhone: string | null;
  displayId: string;
};

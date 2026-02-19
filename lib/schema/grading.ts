import { z } from "zod";

export const participantGradingSchema = z.object({
    id: z.number(),
    created_at: z.string(),
    problem_id: z.number(),
    participant_id: z.number(),
    grader_id: z.string().uuid(),
    answer: z.string().nullable(),
    is_correct: z.boolean().nullable(),
    is_force: z.boolean().default(false),
});

export type ParticipantGrading = z.infer<typeof participantGradingSchema>;

export const teamGradingSchema = z.object({
    id: z.number(),
    created_at: z.string(),
    problem_id: z.number(),
    team_id: z.number(),
    grader_id: z.string().uuid(),
    answer: z.string().nullable(),
    is_correct: z.boolean().nullable(),
    is_force: z.boolean().default(false),
});

export type TeamGrading = z.infer<typeof teamGradingSchema>;

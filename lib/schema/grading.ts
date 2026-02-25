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

export const gradeSubmissionSchema = z.object({
    type: z.enum(["participant", "team"]),
    id: z.number(),
    roundId: z.number(),
    problemId: z.number(),
    answer: z.string().nullable(),
    isCorrect: z.boolean().nullable(),
    isForce: z.boolean().optional(),
});

export type GradeSubmission = z.infer<typeof gradeSubmissionSchema>;

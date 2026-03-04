import { z } from "zod";

export const participantGradingSchema = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }),
    problem_id: z.number(),
    participant_id: z.number(),
    grader_id: z.uuid(),
    answer: z.string().default(""),
    is_correct: z.boolean().default(false),
    is_force: z.boolean().default(false),
});

export type ParticipantGrading = z.infer<typeof participantGradingSchema>;

export const teamGradingSchema = z.object({
    id: z.number(),
    created_at: z.iso.datetime({ offset: true }),
    problem_id: z.number(),
    team_id: z.number(),
    grader_id: z.uuid(),
    answer: z.string().default(""),
    is_correct: z.boolean().default(false),
    is_force: z.boolean().default(false),
});

export type TeamGrading = z.infer<typeof teamGradingSchema>;

export const gradeSubmissionSchema = z.object({
    type: z.enum(["participant", "team"]),
    id: z.number(),
    round_id: z.number(),
    problem_id: z.number(),
    answer: z.string().default(""),
    is_correct: z.boolean().default(false),
    is_force: z.boolean().optional(),
});

export type GradeSubmission = z.infer<typeof gradeSubmissionSchema>;

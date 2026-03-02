import { z } from "zod";

export const PARTICIPANT_GRADING_TABLE_NAME = "participant_grading";
export const TEAM_GRADING_TABLE_NAME = "team_grading";

export const betterParticipantGrading = z.object({
    id: z.number(),
    created_at: z.string(),
    problem_id: z.number(),
    participant_id: z.number(),
    grader_id: z.uuid(),
    answer: z.string().default(""),
    is_correct: z.boolean().default(false),
    is_force: z.boolean().default(false),
});
export type BetterParticipantGrading = z.infer<typeof betterParticipantGrading>;

export const betterTeamGrading = z.object({
    id: z.number(),
    created_at: z.string(),
    problem_id: z.number(),
    team_id: z.number(),
    grader_id: z.uuid(),
    answer: z.string().default(""),
    is_correct: z.boolean().default(false),
    is_force: z.boolean().default(false),
});
export type BetterTeamGrading = z.infer<typeof betterTeamGrading>;

export const betterParticipantGradeSubmission = z.object({
    type: z.enum(["participant", "team"]),
    id: z.number(),
    roundId: z.number(),
    problemId: z.number(),
    answer: z.string().default(""),
    is_correct: z.boolean().default(false),
    is_force: z.boolean().optional(),
});
export type ParticipantGradeSubmission = z.infer<
    typeof betterParticipantGradeSubmission
>;

export const betterTeamGradeSubmission = z.object({
    type: z.enum(["participant", "team"]),
    id: z.number(),
    roundId: z.number(),
    problemId: z.number(),
    answer: z.string().default(""),
    is_correct: z.boolean().default(false),
    is_force: z.boolean().default(false),
});
export type BetterTeamGradeSubmission = z.infer<
    typeof betterTeamGradeSubmission
>;

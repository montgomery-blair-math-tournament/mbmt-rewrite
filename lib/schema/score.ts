import { z } from "zod";

export const GradingStatus = {
    NOT_STARTED: "NOT_STARTED",
    IN_PROGRESS: "IN_PROGRESS",
    CONFLICT: "CONFLICT",
    COMPLETED: "COMPLETED",
} as const;

export type GradingStatusType =
    (typeof GradingStatus)[keyof typeof GradingStatus];

export const participantScoreSchema = z.object({
    participant_id: z.number(),
    round_id: z.number(),
    created_at: z.string(),
    score: z.number().nullable(),
    override_score: z.number().nullable(),
    status: z
        .enum([
            GradingStatus.NOT_STARTED,
            GradingStatus.IN_PROGRESS,
            GradingStatus.CONFLICT,
            GradingStatus.COMPLETED,
        ])
        .default(GradingStatus.NOT_STARTED),
});

export type ParticipantScore = z.infer<typeof participantScoreSchema>;

export const teamScoreSchema = z.object({
    team_id: z.number(),
    round_id: z.number(),
    created_at: z.string(),
    score: z.number().nullable(),
    override_score: z.number().nullable(),
    status: z
        .enum([
            GradingStatus.NOT_STARTED,
            GradingStatus.IN_PROGRESS,
            GradingStatus.CONFLICT,
            GradingStatus.COMPLETED,
        ])
        .default(GradingStatus.NOT_STARTED),
});

export type TeamScore = z.infer<typeof teamScoreSchema>;

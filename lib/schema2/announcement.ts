import z from "zod";

export const ANNOUNCEMENT_TABLE_NAME = "announcement";

export const betterAnnouncementSchema = z.object({
    id: z.number(),
    author: z.uuid(),
    created_at: z.iso.datetime({ offset: true }),
    message: z.string(),
    expires_at: z.iso.datetime({ offset: true }),
});

export type BetterAnnouncement = z.infer<typeof betterAnnouncementSchema>;

import { z } from "zod";

export const announcementSchema = z.object({
    id: z.number(),
    author: z.uuid(),
    created_at: z.iso.datetime({ offset: true }).optional(),
    message: z.string(),
    expires_at: z.iso.datetime({ offset: true }),
});

export type Announcement = z.infer<typeof announcementSchema>;

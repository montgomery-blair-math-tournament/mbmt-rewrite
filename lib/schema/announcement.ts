import { z } from "zod";

export const announcementSchema = z.object({
    id: z.number(),
    author: z.uuid(),
    createdAt: z.string(),
    message: z.string(),
    expiresAt: z.string(),
});

export type Announcement = z.infer<typeof announcementSchema>;

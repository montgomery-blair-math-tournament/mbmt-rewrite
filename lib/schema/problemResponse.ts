import { z } from "zod";
import { problemSchema } from "./problem";

export const problemResponseSchema = z.object({
    problem: problemSchema,
    response: z.string(),
});

export type ProblemResponse = z.infer<typeof problemResponseSchema>;

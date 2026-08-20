import { z } from "zod";

export const submitAnswerSchema = z.object({
  value: z
    .string({ error: "Answer is required" })
    .trim()
    .min(1, "Answer is required"),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

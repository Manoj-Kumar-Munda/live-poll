import { z } from "zod";

const submitAnswerSchema = z.object({
  value: z
    .string({ error: "Answer is required" })
    .trim()
    .min(1, "Answer is required"),
  sessionId: z.string().optional(),
});

type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export { submitAnswerSchema };
export type { SubmitAnswerInput };

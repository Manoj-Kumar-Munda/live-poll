import { z } from "zod";
import { QUIZ_STATUS } from "@/types/quiz.types.js";
import { QUIZ_LIMITS } from "./quiz.constants.js";

export const createQuizSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(
      QUIZ_LIMITS.titleMaxLength,
      `Title must be at most ${QUIZ_LIMITS.titleMaxLength} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      QUIZ_LIMITS.descriptionMaxLength,
      `Description must be at most ${QUIZ_LIMITS.descriptionMaxLength} characters`,
    )
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  pointsPerQuestion: z
    .number({ error: "Points per question must be a number" })
    .int("Points per question must be a whole number")
    .min(
      QUIZ_LIMITS.pointsPerQuestion.min,
      `Points per question must be at least ${QUIZ_LIMITS.pointsPerQuestion.min}`,
    )
    .max(
      QUIZ_LIMITS.pointsPerQuestion.max,
      `Points per question must be at most ${QUIZ_LIMITS.pointsPerQuestion.max}`,
    )
    .default(QUIZ_LIMITS.pointsPerQuestion.default),
  timeLimitSeconds: z
    .number({ error: "Time limit must be a number" })
    .int("Time limit must be a whole number")
    .min(
      QUIZ_LIMITS.timeLimitSeconds.min,
      `Time limit must be at least ${QUIZ_LIMITS.timeLimitSeconds.min} seconds`,
    )
    .max(
      QUIZ_LIMITS.timeLimitSeconds.max,
      `Time limit must be at most ${QUIZ_LIMITS.timeLimitSeconds.max} seconds`,
    )
    .default(QUIZ_LIMITS.timeLimitSeconds.default),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const listQuizzesQuerySchema = z.object({
  status: z
    .enum([QUIZ_STATUS.DRAFT, QUIZ_STATUS.PUBLISHED, QUIZ_STATUS.ARCHIVED], {
      error: "Status must be DRAFT, PUBLISHED, or ARCHIVED",
    })
    .optional(),
});

export type ListQuizzesQuery = z.infer<typeof listQuizzesQuerySchema>;

/**
 * Maps validated API input + auth context to Mongoose create payload.
 * Keeps createQuizSchema and Quiz model fields in sync.
 */
export function toQuizCreateDocument(
  ownerId: string,
  input: CreateQuizInput,
) {
  return {
    ownerId,
    title: input.title,
    description: input.description ?? null,
    status: QUIZ_STATUS.DRAFT,
    pointsPerQuestion: input.pointsPerQuestion,
    durationPerQuestion: input.timeLimitSeconds * 1000,
  };
}

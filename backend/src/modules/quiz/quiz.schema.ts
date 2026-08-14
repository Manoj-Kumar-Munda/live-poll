import { z } from "zod";
import mongoose from "mongoose";
import { QUIZ_STATUS } from "@/types/quiz.types.js";
import { QUIZ_LIMITS } from "./quiz.constants.js";

function isValidMongoObjectId(value: string): boolean {
  if (!/^[a-f\d]{24}$/i.test(value)) {
    return false;
  }

  return String(new mongoose.Types.ObjectId(value)) === value;
}

export const mongoObjectIdSchema = z
  .string({ error: "Id is required" })
  .refine(isValidMongoObjectId, { message: "Invalid quiz id" });

const quizTitleSchema = z
  .string({ error: "Title is required" })
  .trim()
  .min(1, "Title is required")
  .max(
    QUIZ_LIMITS.titleMaxLength,
    `Title must be at most ${QUIZ_LIMITS.titleMaxLength} characters`,
  );

const quizDescriptionSchema = z
  .string()
  .trim()
  .max(
    QUIZ_LIMITS.descriptionMaxLength,
    `Description must be at most ${QUIZ_LIMITS.descriptionMaxLength} characters`,
  )
  .transform((value) => (value === "" ? undefined : value));

const quizPointsPerQuestionSchema = z
  .number({ error: "Points per question must be a number" })
  .int("Points per question must be a whole number")
  .min(
    QUIZ_LIMITS.pointsPerQuestion.min,
    `Points per question must be at least ${QUIZ_LIMITS.pointsPerQuestion.min}`,
  )
  .max(
    QUIZ_LIMITS.pointsPerQuestion.max,
    `Points per question must be at most ${QUIZ_LIMITS.pointsPerQuestion.max}`,
  );

const quizTimeLimitSecondsSchema = z
  .number({ error: "Time limit must be a number" })
  .int("Time limit must be a whole number")
  .min(
    QUIZ_LIMITS.timeLimitSeconds.min,
    `Time limit must be at least ${QUIZ_LIMITS.timeLimitSeconds.min} seconds`,
  )
  .max(
    QUIZ_LIMITS.timeLimitSeconds.max,
    `Time limit must be at most ${QUIZ_LIMITS.timeLimitSeconds.max} seconds`,
  );

export const createQuizSchema = z.object({
  title: quizTitleSchema,
  description: quizDescriptionSchema.optional(),
  pointsPerQuestion: quizPointsPerQuestionSchema.default(
    QUIZ_LIMITS.pointsPerQuestion.default,
  ),
  timeLimitSeconds: quizTimeLimitSecondsSchema.default(
    QUIZ_LIMITS.timeLimitSeconds.default,
  ),
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

export const getQuizByIdSchema = z.object({
  id: mongoObjectIdSchema,
});

export const updateQuizByIdSchema = z.object({
  id: mongoObjectIdSchema,
});

export const updateQuizFieldsSchema = z
  .object({
    title: quizTitleSchema.optional(),
    description: quizDescriptionSchema.optional(),
    pointsPerQuestion: quizPointsPerQuestionSchema.optional(),
    timeLimitSeconds: quizTimeLimitSecondsSchema.optional(),
  })
  .refine(
    (fields) =>
      fields.title !== undefined ||
      fields.description !== undefined ||
      fields.pointsPerQuestion !== undefined ||
      fields.timeLimitSeconds !== undefined,
    { message: "At least one field is required" },
  );

export type UpdateQuizFields = z.infer<typeof updateQuizFieldsSchema>;

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

export function toQuizUpdateDocument(fields: UpdateQuizFields) {
  const update: {
    title?: string;
    description?: string | null;
    pointsPerQuestion?: number;
    durationPerQuestion?: number;
  } = {};

  if (fields.title !== undefined) {
    update.title = fields.title;
  }

  if (fields.description !== undefined) {
    update.description = fields.description ?? null;
  }

  if (fields.pointsPerQuestion !== undefined) {
    update.pointsPerQuestion = fields.pointsPerQuestion;
  }

  if (fields.timeLimitSeconds !== undefined) {
    update.durationPerQuestion = fields.timeLimitSeconds * 1000;
  }

  return update;
}

export const deleteQuizByIdSchema = z.object({
  id: mongoObjectIdSchema,
});

export type DeleteQuizByIdInput = z.infer<typeof deleteQuizByIdSchema>;
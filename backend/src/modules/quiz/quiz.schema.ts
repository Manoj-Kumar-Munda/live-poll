import { z } from "zod";
import mongoose from "mongoose";
import { QUESTION_TYPE, QUIZ_STATUS } from "@/types/quiz.types.js";
import { QUESTION_LIMITS, QUIZ_LIMITS } from "./quiz.constants.js";
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

export const addQuestionParamsSchema = z.object({
  quizId: mongoObjectIdSchema,
});

const promptSchema = z
  .string({ error: "Prompt is required" })
  .trim()
  .min(1, "Prompt is required")
  .max(
    QUESTION_LIMITS.promptMaxLength,
    `Prompt must be at most ${QUESTION_LIMITS.promptMaxLength} characters`,
  );

const optionSchema = z
  .string({ error: "Option is required" })
  .trim()
  .min(1, "Option must not be empty")
  .max(
    QUESTION_LIMITS.optionMaxLength,
    `Option must be at most ${QUESTION_LIMITS.optionMaxLength} characters`,
  );

function uniqueLowercaseOptions(
  options: string[],
  ctx: z.RefinementCtx,
  min: number,
  max: number,
) {
  if (options.length < min) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: `Provide at least ${min} options`,
    });
  }

  if (options.length > max) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: `Provide at most ${max} options`,
    });
  }

  const normalized = options.map((option) => option.toLowerCase());
  if (new Set(normalized).size !== normalized.length) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: "Options must be unique",
    });
  }
}

const mcqQuestionSchema = z
  .object({
    type: z.literal(QUESTION_TYPE.MCQ),
    prompt: promptSchema,
    options: z.array(optionSchema),
    correctAnswer: z
      .string({ error: "Correct answer is required" })
      .trim()
      .min(1, "Correct answer is required"),
  })
  .superRefine((value, ctx) => {
    uniqueLowercaseOptions(
      value.options,
      ctx,
      QUESTION_LIMITS.mcqOptions.min,
      QUESTION_LIMITS.mcqOptions.max,
    );

    const options = value.options.map((option) => option.toLowerCase());
    if (!options.includes(value.correctAnswer.toLowerCase())) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Correct answer must match one of the options",
      });
    }
  });

const pollQuestionSchema = z
  .object({
    type: z.literal(QUESTION_TYPE.POLL),
    prompt: promptSchema,
    options: z.array(optionSchema),
  })
  .superRefine((value, ctx) => {
    uniqueLowercaseOptions(
      value.options,
      ctx,
      QUESTION_LIMITS.pollOptions.min,
      QUESTION_LIMITS.pollOptions.max,
    );
  });

const openTextQuestionSchema = z.object({
  type: z.literal(QUESTION_TYPE.OPEN_TEXT),
  prompt: promptSchema,
  maxLength: z
    .number({ error: "Max length must be a number" })
    .int("Max length must be a whole number")
    .min(
      QUESTION_LIMITS.openTextMaxLength.min,
      `Max length must be at least ${QUESTION_LIMITS.openTextMaxLength.min}`,
    )
    .max(
      QUESTION_LIMITS.openTextMaxLength.max,
      `Max length must be at most ${QUESTION_LIMITS.openTextMaxLength.max}`,
    )
    .default(QUESTION_LIMITS.openTextMaxLength.default),
});

export const addQuestionSchema = z.discriminatedUnion("type", [
  mcqQuestionSchema,
  pollQuestionSchema,
  openTextQuestionSchema,
]);

export type AddQuestionInput = z.infer<typeof addQuestionSchema>;

export function toQuestionCreateDocument(
  ownerId: string,
  input: AddQuestionInput,
) {
  if (input.type === QUESTION_TYPE.MCQ) {
    const options = input.options.map((option) => option.toLowerCase());
    return {
      ownerId,
      type: input.type,
      prompt: input.prompt,
      options,
      correctAnswer: input.correctAnswer.toLowerCase(),
    };
  }

  if (input.type === QUESTION_TYPE.POLL) {
    return {
      ownerId,
      type: input.type,
      prompt: input.prompt,
      options: input.options.map((option) => option.toLowerCase()),
    };
  }

  return {
    ownerId,
    type: input.type,
    prompt: input.prompt,
    maxLength: input.maxLength,
  };
}
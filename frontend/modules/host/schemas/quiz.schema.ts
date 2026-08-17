import { z } from "zod";

/** Number inputs use valueAsNumber — empty fields become NaN. */
function requiredInt(label: string, min: number, max: number) {
  return z
    .number()
    .superRefine((value, ctx) => {
      if (Number.isNaN(value)) {
        ctx.addIssue({ code: "custom", message: `${label} is required` });
        return;
      }
      if (!Number.isInteger(value)) {
        ctx.addIssue({
          code: "custom",
          message: `${label} must be a whole number`,
        });
        return;
      }
      if (value < min) {
        ctx.addIssue({
          code: "custom",
          message: `${label} must be at least ${min}`,
        });
      }
      if (value > max) {
        ctx.addIssue({
          code: "custom",
          message: `${label} must be at most ${max}`,
        });
      }
    });
}

export const createQuizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional(),
  pointsPerQuestion: requiredInt("Points per question", 1, 1000),
  timeLimitSeconds: requiredInt("Time limit (seconds)", 5, 300),
});

export type CreateQuizValues = z.infer<typeof createQuizSchema>;

const optionSchema = z
  .string()
  .trim()
  .min(1, "Option must not be empty")
  .max(120, "Option must be 120 characters or fewer");

export const questionFormSchema = z
  .object({
    type: z.enum(["MCQ", "POLL", "OPEN_TEXT"]),
    prompt: z
      .string()
      .trim()
      .min(1, "Prompt is required")
      .max(500, "Prompt must be 500 characters or fewer"),
    options: z.array(optionSchema),
    correctAnswer: z.string(),
    maxLength: requiredInt("Character limit", 1, 500),
  })
  .superRefine((value, ctx) => {
    if (value.type === "OPEN_TEXT") {
      return;
    }

    const min = value.type === "MCQ" ? 2 : 2;
    const max = value.type === "MCQ" ? 4 : 6;

    if (value.options.length < min) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: `Provide at least ${min} options`,
      });
    }

    if (value.options.length > max) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: `Provide at most ${max} options`,
      });
    }

    const normalized = value.options.map((option) => option.toLowerCase());
    if (new Set(normalized).size !== normalized.length) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Options must be unique",
      });
    }

    if (value.type === "MCQ") {
      if (!value.correctAnswer.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "Correct answer is required",
        });
        return;
      }

      if (!normalized.includes(value.correctAnswer.toLowerCase())) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "Correct answer must match one of the options",
        });
      }
    }
  });

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

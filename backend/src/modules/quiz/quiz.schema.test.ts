import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { QUESTION_TYPE, QUIZ_STATUS } from "@/types/quiz.types.js";
import {
  addQuestionSchema,
  createQuizSchema,
  getQuizByIdSchema,
  listQuizzesQuerySchema,
  questionOnQuizParamsSchema,
  toQuestionSubdocument,
  toQuizCreateDocument,
  toQuizUpdateDocument,
  updateQuizByIdSchema,
  updateQuizFieldsSchema,
} from "./quiz.schema.js";

function getValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

describe("createQuizSchema", () => {
  it("accepts a valid payload with defaults", () => {
    const result = createQuizSchema.parse({
      title: "My Quiz",
    });

    expect(result).toEqual({
      title: "My Quiz",
      pointsPerQuestion: 10,
      timeLimitSeconds: 30,
    });
  });

  it("accepts all optional fields", () => {
    const result = createQuizSchema.parse({
      title: "My Quiz",
      description: "A short description",
      pointsPerQuestion: 20,
      timeLimitSeconds: 60,
    });

    expect(result).toEqual({
      title: "My Quiz",
      description: "A short description",
      pointsPerQuestion: 20,
      timeLimitSeconds: 60,
    });
  });

  it("rejects a missing title with a formatted error", () => {
    try {
      createQuizSchema.parse({});
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "title",
            message: "Title is required",
          }),
        ]),
      );
    }
  });

  it("rejects an empty title", () => {
    try {
      createQuizSchema.parse({ title: "   " });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "title",
            message: "Title is required",
          }),
        ]),
      );
    }
  });

  it("rejects a title that is too long", () => {
    try {
      createQuizSchema.parse({ title: "a".repeat(121) });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "title",
            message: "Title must be at most 120 characters",
          }),
        ]),
      );
    }
  });

  it("rejects invalid pointsPerQuestion", () => {
    try {
      createQuizSchema.parse({
        title: "My Quiz",
        pointsPerQuestion: 0,
      });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "pointsPerQuestion",
            message: "Points per question must be at least 1",
          }),
        ]),
      );
    }
  });

  it("normalizes an empty description to undefined", () => {
    const result = createQuizSchema.parse({
      title: "My Quiz",
      description: "   ",
    });

    expect(result.description).toBeUndefined();
  });

  it("maps validated input to all quiz document fields required on create", () => {
    const input = createQuizSchema.parse({ title: "My Quiz" });
    const document = toQuizCreateDocument("user-123", input);

    expect(document).toEqual({
      ownerId: "user-123",
      title: "My Quiz",
      description: null,
      status: QUIZ_STATUS.DRAFT,
      pointsPerQuestion: 10,
      durationPerQuestion: 30_000,
    });
  });

  it("rejects timeLimitSeconds outside model bounds", () => {
    try {
      createQuizSchema.parse({
        title: "My Quiz",
        timeLimitSeconds: 301,
      });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "timeLimitSeconds",
            message: "Time limit must be at most 300 seconds",
          }),
        ]),
      );
    }
  });
});

describe("listQuizzesQuerySchema", () => {
  it("accepts an empty query", () => {
    expect(listQuizzesQuerySchema.parse({})).toEqual({});
  });

  it("accepts a valid status filter", () => {
    expect(listQuizzesQuerySchema.parse({ status: "DRAFT" })).toEqual({
      status: QUIZ_STATUS.DRAFT,
    });
  });

  it("rejects an invalid status with a formatted error", () => {
    try {
      listQuizzesQuerySchema.parse({ status: "LIVE" });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "status",
            message: "Status must be DRAFT, PUBLISHED, or ARCHIVED",
          }),
        ]),
      );
    }
  });
});

describe("getQuizByIdSchema", () => {
  it("accepts a valid MongoDB ObjectId", () => {
    const id = "674a1b2c3d4e5f6789012345";

    expect(getQuizByIdSchema.parse({ id })).toEqual({ id });
  });

  it("rejects a UUID", () => {
    try {
      getQuizByIdSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "id",
            message: "Invalid quiz id",
          }),
        ]),
      );
    }
  });

  it("rejects a malformed id", () => {
    try {
      getQuizByIdSchema.parse({ id: "not-an-id" });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "id",
            message: "Invalid quiz id",
          }),
        ]),
      );
    }
  });
});

describe("updateQuizByIdSchema", () => {
  it("accepts a valid MongoDB ObjectId", () => {
    const id = "674a1b2c3d4e5f6789012345";

    expect(updateQuizByIdSchema.parse({ id })).toEqual({ id });
  });
});

describe("updateQuizFieldsSchema", () => {
  it("accepts a partial update with one field", () => {
    expect(updateQuizFieldsSchema.parse({ title: "Updated title" })).toEqual({
      title: "Updated title",
    });
  });

  it("accepts multiple fields", () => {
    expect(
      updateQuizFieldsSchema.parse({
        title: "Updated title",
        timeLimitSeconds: 45,
      }),
    ).toEqual({
      title: "Updated title",
      timeLimitSeconds: 45,
    });
  });

  it("rejects an empty body", () => {
    try {
      updateQuizFieldsSchema.parse({});
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "At least one field is required",
          }),
        ]),
      );
    }
  });

  it("rejects an empty title", () => {
    try {
      updateQuizFieldsSchema.parse({ title: "   " });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "title",
            message: "Title is required",
          }),
        ]),
      );
    }
  });

  it("maps validated fields to mongoose update document", () => {
    const fields = updateQuizFieldsSchema.parse({
      title: "Updated title",
      timeLimitSeconds: 60,
    });

    expect(toQuizUpdateDocument(fields)).toEqual({
      title: "Updated title",
      durationPerQuestion: 60_000,
    });
  });
});

describe("questionOnQuizParamsSchema", () => {
  it("accepts quiz and question ObjectIds", () => {
    const quizId = "507f1f77bcf86cd799439011";
    const questionId = "507f1f77bcf86cd799439012";
    expect(questionOnQuizParamsSchema.parse({ quizId, questionId })).toEqual({
      quizId,
      questionId,
    });
  });
});

describe("addQuestionSchema", () => {
  it("accepts an MCQ with a matching correct answer", () => {
    const result = addQuestionSchema.parse({
      type: "MCQ",
      prompt: "Capital of France?",
      options: ["Paris", "Rome", "Madrid"],
      correctAnswer: "Paris",
    });

    expect(result.type).toBe(QUESTION_TYPE.MCQ);
  });

  it("rejects an MCQ whose correct answer is not in options", () => {
    try {
      addQuestionSchema.parse({
        type: "MCQ",
        prompt: "Capital of France?",
        options: ["Paris", "Rome"],
        correctAnswer: "Berlin",
      });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "correctAnswer",
            message: "Correct answer must match one of the options",
          }),
        ]),
      );
    }
  });

  it("accepts a POLL with host-defined options and no correct answer", () => {
    const result = addQuestionSchema.parse({
      type: "POLL",
      prompt: "Which topic next?",
      options: ["React", "Node.js"],
    });

    expect(result).toMatchObject({
      type: QUESTION_TYPE.POLL,
      prompt: "Which topic next?",
    });
  });

  it("rejects duplicate POLL options", () => {
    try {
      addQuestionSchema.parse({
        type: "POLL",
        prompt: "Which topic next?",
        options: ["React", "react"],
      });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "options",
            message: "Options must be unique",
          }),
        ]),
      );
    }
  });

  it("accepts OPEN_TEXT with default maxLength", () => {
    const result = addQuestionSchema.parse({
      type: "OPEN_TEXT",
      prompt: "One word for this session",
    });

    expect(result).toEqual({
      type: QUESTION_TYPE.OPEN_TEXT,
      prompt: "One word for this session",
      maxLength: 80,
    });
  });

  it("maps MCQ options and answer to lowercase", () => {
    const input = addQuestionSchema.parse({
      type: "MCQ",
      prompt: "Capital of France?",
      options: ["Paris", "Rome"],
      correctAnswer: "Paris",
    });

    expect(toQuestionSubdocument(input)).toEqual({
      type: QUESTION_TYPE.MCQ,
      prompt: "Capital of France?",
      options: ["paris", "rome"],
      correctAnswer: "paris",
    });
  });
});

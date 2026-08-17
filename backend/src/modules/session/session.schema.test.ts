import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  createSessionSchema,
  joinSessionSchema,
  listSessionsQuerySchema,
  sessionIdParamsSchema,
} from "./session.schema.js";

function getValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

describe("createSessionSchema", () => {
  it("accepts a valid quiz id", () => {
    const result = createSessionSchema.parse({
      quizId: "507f1f77bcf86cd799439011",
    });

    expect(result.quizId).toBe("507f1f77bcf86cd799439011");
  });

  it("rejects an invalid quiz id", () => {
    expect(() => createSessionSchema.parse({ quizId: "bad" })).toThrow(ZodError);
  });
});

describe("joinSessionSchema", () => {
  it("normalizes room code to uppercase", () => {
    const result = joinSessionSchema.parse({ roomCode: "abcdef" });

    expect(result.roomCode).toBe("ABCDEF");
  });

  it("rejects short room codes", () => {
    try {
      joinSessionSchema.parse({ roomCode: "ABC" });
      expect.fail("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(getValidationErrors(error as ZodError)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "roomCode" }),
        ]),
      );
    }
  });
});

describe("listSessionsQuerySchema", () => {
  it("accepts optional filters", () => {
    const result = listSessionsQuerySchema.parse({
      quizId: "507f1f77bcf86cd799439011",
      status: "WAITING",
    });

    expect(result).toEqual({
      quizId: "507f1f77bcf86cd799439011",
      status: "WAITING",
    });
  });
});

describe("sessionIdParamsSchema", () => {
  it("parses route params", () => {
    const result = sessionIdParamsSchema.parse({
      sessionId: "507f1f77bcf86cd799439011",
    });

    expect(result.sessionId).toBe("507f1f77bcf86cd799439011");
  });
});

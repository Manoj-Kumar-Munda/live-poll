import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { submitAnswerSchema } from "./answer.schema.js";

describe("submitAnswerSchema", () => {
  it("accepts a non-empty answer value", () => {
    const result = submitAnswerSchema.parse({ value: "paris" });

    expect(result.value).toBe("paris");
  });

  it("rejects empty answers", () => {
    expect(() => submitAnswerSchema.parse({ value: "   " })).toThrow(ZodError);
  });
});

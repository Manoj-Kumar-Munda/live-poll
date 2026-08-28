import { describe, expect, it } from "vitest";
import { SESSION_STATUS } from "@/types/session.types.js";

describe("listPublishedQuizzesQuerySchema", () => {
  it("accepts an empty query", async () => {
    const { listPublishedQuizzesQuerySchema } = await import("./quiz.schema.js");
    expect(listPublishedQuizzesQuerySchema.parse({})).toEqual({});
  });

  it("accepts WAITING and LIVE filters", async () => {
    const { listPublishedQuizzesQuerySchema } = await import("./quiz.schema.js");
    expect(
      listPublishedQuizzesQuerySchema.parse({ status: SESSION_STATUS.WAITING }),
    ).toEqual({ status: SESSION_STATUS.WAITING });
    expect(
      listPublishedQuizzesQuerySchema.parse({ status: SESSION_STATUS.LIVE }),
    ).toEqual({ status: SESSION_STATUS.LIVE });
  });

  it("rejects invalid status values", async () => {
    const { listPublishedQuizzesQuerySchema } = await import("./quiz.schema.js");
    expect(() =>
      listPublishedQuizzesQuerySchema.parse({ status: "FINISHED" }),
    ).toThrow();
  });
});

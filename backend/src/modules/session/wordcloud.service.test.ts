import { beforeEach, describe, expect, it } from "vitest";
import {
  clearWordCloud,
  getWordCloudSnapshot,
  recordWordCloudAnswer,
  toWordResults,
} from "./wordcloud.service.js";

describe("wordcloud.service", () => {
  const sessionId = "session-1";
  const questionIndex = 0;

  beforeEach(() => {
    clearWordCloud(sessionId, questionIndex);
  });

  it("creates a new term on first answer", () => {
    const result = recordWordCloudAnswer(sessionId, questionIndex, "Apple");

    expect(result.isNew).toBe(true);
    expect(result.term).toEqual({ key: "apple", label: "Apple", count: 1 });
  });

  it("merges case-insensitive duplicates and keeps first label", () => {
    recordWordCloudAnswer(sessionId, questionIndex, "Apple");
    const result = recordWordCloudAnswer(sessionId, questionIndex, "apple");

    expect(result.isNew).toBe(false);
    expect(result.term).toEqual({ key: "apple", label: "Apple", count: 2 });
    expect(getWordCloudSnapshot(sessionId, questionIndex)).toHaveLength(1);
  });

  it("sorts results by count descending", () => {
    recordWordCloudAnswer(sessionId, questionIndex, "rare");
    recordWordCloudAnswer(sessionId, questionIndex, "popular");
    recordWordCloudAnswer(sessionId, questionIndex, "popular");

    expect(toWordResults(getWordCloudSnapshot(sessionId, questionIndex))).toEqual([
      { key: "popular", label: "popular", count: 2 },
      { key: "rare", label: "rare", count: 1 },
    ]);
  });
});

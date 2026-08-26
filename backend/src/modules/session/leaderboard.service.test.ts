import { describe, expect, it } from "vitest";
import {
  getRankForUser,
  rankParticipants,
} from "./leaderboard.service.js";

describe("rankParticipants", () => {
  it("assigns olympic ranks for tied scores", () => {
    const entries = rankParticipants([
      {
        userId: "1",
        displayName: "Alice",
        score: 20,
        joinedAt: new Date("2026-01-01T10:00:00Z"),
      },
      {
        userId: "2",
        displayName: "Bob",
        score: 20,
        joinedAt: new Date("2026-01-01T10:05:00Z"),
      },
      {
        userId: "3",
        displayName: "Cara",
        score: 10,
        joinedAt: new Date("2026-01-01T09:00:00Z"),
      },
    ]);

    expect(entries).toEqual([
      { userId: "1", displayName: "Alice", score: 20, rank: 1 },
      { userId: "2", displayName: "Bob", score: 20, rank: 1 },
      { userId: "3", displayName: "Cara", score: 10, rank: 3 },
    ]);
    expect(getRankForUser(entries, "2")).toBe(1);
    expect(getRankForUser(entries, "3")).toBe(3);
  });
});

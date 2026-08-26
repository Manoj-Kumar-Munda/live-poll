import { PARTICIPANT_STATUS } from "@/types/quiz.types.js";
import { SessionParticipant } from "./participant.model.js";
import type { LeaderboardEntry, LeaderboardUpdatedPayload } from "./session.types.js";

const leaderboards = new Map<string, LeaderboardEntry[]>();

type RankableParticipant = {
  userId: string;
  displayName: string;
  score: number;
  joinedAt: Date;
};

function assignRanks(participants: RankableParticipant[]): LeaderboardEntry[] {
  const sorted = [...participants].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.joinedAt.getTime() - right.joinedAt.getTime();
  });

  let rank = 0;
  let lastScore: number | null = null;

  return sorted.map((participant, index) => {
    if (lastScore === null || participant.score !== lastScore) {
      rank = index + 1;
      lastScore = participant.score;
    }

    return {
      userId: participant.userId,
      displayName: participant.displayName,
      score: participant.score,
      rank,
    };
  });
}

export function rankParticipants(
  participants: RankableParticipant[],
): LeaderboardEntry[] {
  return assignRanks(participants);
}

export function getRankForUser(
  entries: LeaderboardEntry[],
  userId: string,
): number | null {
  return entries.find((entry) => entry.userId === userId)?.rank ?? null;
}

export async function rebuildLeaderboard(
  sessionId: string,
): Promise<LeaderboardEntry[]> {
  const participants = await SessionParticipant.find({
    sessionId,
    status: {
      $in: [PARTICIPANT_STATUS.ACTIVE, PARTICIPANT_STATUS.FINISHED],
    },
  }).exec();

  const entries = assignRanks(
    participants.map((participant) => ({
      userId: participant.userId,
      displayName: participant.displayName,
      score: participant.score,
      joinedAt: participant.joinedAt,
    })),
  );

  leaderboards.set(sessionId, entries);
  return entries;
}

export async function getLeaderboardPayload(
  sessionId: string,
  final = false,
): Promise<LeaderboardUpdatedPayload | null> {
  const cached = leaderboards.get(sessionId);
  const entries = cached ?? (await rebuildLeaderboard(sessionId));

  if (entries.length === 0) {
    return null;
  }

  return {
    sessionId,
    entries,
    final,
  };
}

export async function finalizeLeaderboard(
  sessionId: string,
): Promise<LeaderboardUpdatedPayload | null> {
  const entries = await rebuildLeaderboard(sessionId);

  if (entries.length === 0) {
    leaderboards.delete(sessionId);
    return null;
  }

  await SessionParticipant.bulkWrite(
    entries.map((entry) => ({
      updateOne: {
        filter: { sessionId, userId: entry.userId },
        update: { $set: { finalRank: entry.rank } },
      },
    })),
  );

  return {
    sessionId,
    entries,
    final: true,
  };
}

export function clearLeaderboard(sessionId: string) {
  leaderboards.delete(sessionId);
}

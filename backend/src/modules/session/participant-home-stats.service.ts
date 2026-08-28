import { SESSION_STATUS } from "@/types/session.types.js";
import { Answer } from "./answer.model.js";
import { Session } from "./session.model.js";
import { SessionParticipant } from "./participant.model.js";
import type { ParticipantHomeStats } from "./session.types.js";

type AggregationResult = {
  totalQuizzesPlayed: number;
  totalScore: number;
  bestRank: number | null;
};

/**
 * Aggregates a registered participant's history across finished sessions.
 * Uses indexed lookups on SessionParticipant.userId and Answer.userId.
 */
export async function getParticipantHomeStats(
  userId: string,
): Promise<ParticipantHomeStats> {
  const [aggregated, totalQuestionsAnswered] = await Promise.all([
    SessionParticipant.aggregate<AggregationResult>([
      { $match: { userId } },
      {
        $lookup: {
          from: Session.collection.name,
          localField: "sessionId",
          foreignField: "_id",
          as: "session",
        },
      },
      { $unwind: "$session" },
      { $match: { "session.status": SESSION_STATUS.FINISHED } },
      {
        $group: {
          _id: null,
          totalQuizzesPlayed: { $sum: 1 },
          totalScore: { $sum: "$score" },
          bestRank: { $min: "$finalRank" },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuizzesPlayed: 1,
          totalScore: 1,
          bestRank: 1,
        },
      },
    ]).exec(),
    Answer.countDocuments({ userId }).exec(),
  ]);

  const result = aggregated[0];

  return {
    totalQuizzesPlayed: result?.totalQuizzesPlayed ?? 0,
    totalScore: result?.totalScore ?? 0,
    bestRank: result?.bestRank ?? null,
    totalQuestionsAnswered,
  };
}

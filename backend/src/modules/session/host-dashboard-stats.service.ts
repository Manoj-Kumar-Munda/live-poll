import { PARTICIPANT_STATUS } from "@/types/quiz.types.js";
import { SessionParticipant } from "./participant.model.js";
import { Session } from "./session.model.js";
import type { HostDashboardStats } from "./session.types.js";

const COUNTED_PARTICIPANT_STATUSES = [
  PARTICIPANT_STATUS.ACTIVE,
  PARTICIPANT_STATUS.FINISHED,
] as const;

type AggregationResult = {
  totalEventsHosted: number;
  totalParticipants: number;
};

/**
 * One indexed aggregation pass over the host's sessions:
 * - $match uses hostId index (no session ids loaded into app memory)
 * - $facet counts events and sums per-session participant counts in parallel
 * - each $lookup subpipeline uses { sessionId, status } index and $count only
 */
export async function getHostDashboardStats(
  hostId: string,
): Promise<HostDashboardStats> {
  const [result] = await Session.aggregate<AggregationResult>([
    { $match: { hostId } },
    {
      $facet: {
        events: [{ $count: "count" }],
        participants: [
          {
            $lookup: {
              from: SessionParticipant.collection.name,
              let: { sessionId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$sessionId", "$$sessionId"] },
                    status: { $in: COUNTED_PARTICIPANT_STATUSES },
                  },
                },
                { $count: "count" },
              ],
              as: "participantCount",
            },
          },
          {
            $group: {
              _id: null,
              totalParticipants: {
                $sum: {
                  $ifNull: [
                    { $arrayElemAt: ["$participantCount.count", 0] },
                    0,
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalEventsHosted: {
          $ifNull: [{ $arrayElemAt: ["$events.count", 0] }, 0],
        },
        totalParticipants: {
          $ifNull: [
            { $arrayElemAt: ["$participants.totalParticipants", 0] },
            0,
          ],
        },
      },
    },
  ]).exec();

  const totalEventsHosted = result?.totalEventsHosted ?? 0;
  const totalParticipants = result?.totalParticipants ?? 0;

  return {
    totalEventsHosted,
    totalParticipants,
    avgParticipantsPerEvent:
      totalEventsHosted > 0
        ? Math.round(totalParticipants / totalEventsHosted)
        : 0,
  };
}

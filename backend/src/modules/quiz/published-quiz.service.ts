import { getAuthDb } from "@/config/db.js";
import { SessionParticipant } from "@/modules/session/participant.model.js";
import { Session } from "@/modules/session/session.model.js";
import { PARTICIPANT_STATUS } from "@/types/quiz.types.js";
import { QUIZ_STATUS } from "@/types/quiz.types.js";
import { SESSION_STATUS } from "@/types/session.types.js";
import type { ListPublishedQuizzesQuery } from "./quiz.schema.js";
import { Quiz } from "./quiz.model.js";
import type { PublishedQuizResponse } from "./quiz.types.js";

const ACTIVE_SESSION_STATUSES = [
  SESSION_STATUS.WAITING,
  SESSION_STATUS.LIVE,
] as const;

const COUNTED_PARTICIPANT_STATUSES = [
  PARTICIPANT_STATUS.ACTIVE,
  PARTICIPANT_STATUS.FINISHED,
] as const;

type AggregationRow = {
  _id: { toString(): string };
  status: "WAITING" | "LIVE";
  updatedAt: Date;
  quiz: {
    _id: { toString(): string };
    ownerId: string;
    title: string;
    description?: string | null;
    pointsPerQuestion: number;
    durationPerQuestion: number;
    questions: unknown[];
    updatedAt: Date;
  };
  host: { name: string }[];
  participantCount: { count: number }[];
};

function toPublishedQuizResponse(row: AggregationRow): PublishedQuizResponse {
  const hostName = row.host[0]?.name?.trim() || "Host";

  return {
    id: row.quiz._id.toString(),
    title: row.quiz.title,
    description: row.quiz.description ?? null,
    questionCount: row.quiz.questions.length,
    timeLimitSeconds: Math.round(row.quiz.durationPerQuestion / 1000),
    pointsPerQuestion: row.quiz.pointsPerQuestion,
    hostName,
    updatedAt: row.quiz.updatedAt.toISOString(),
    liveSession: {
      sessionId: row._id.toString(),
      status: row.status,
      participantCount:
        row.participantCount[0]?.count ?? 0,
    },
  };
}

export async function listPublishedQuizzes(
  query: ListPublishedQuizzesQuery,
): Promise<PublishedQuizResponse[]> {
  const now = new Date();
  const sessionMatch: Record<string, unknown> = {
    status: { $in: ACTIVE_SESSION_STATUSES },
    expiresAt: { $gt: now },
  };

  if (query.status) {
    sessionMatch.status = query.status;
  }

  const rows = await Session.aggregate<AggregationRow>([
    { $match: sessionMatch },
    {
      $addFields: {
        _statusOrder: {
          $cond: [{ $eq: ["$status", SESSION_STATUS.WAITING] }, 0, 1],
        },
      },
    },
    { $sort: { _statusOrder: 1, updatedAt: -1 } },
    {
      $lookup: {
        from: Quiz.collection.name,
        localField: "quizId",
        foreignField: "_id",
        as: "quiz",
      },
    },
    { $unwind: "$quiz" },
    { $match: { "quiz.status": QUIZ_STATUS.PUBLISHED } },
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
      $lookup: {
        from: getAuthDb().collection("user").collectionName,
        let: { ownerId: "$quiz.ownerId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$id", "$$ownerId"] },
            },
          },
          { $project: { name: 1, _id: 0 } },
        ],
        as: "host",
      },
    },
    {
      $project: {
        status: 1,
        updatedAt: 1,
        quiz: {
          _id: "$quiz._id",
          title: "$quiz.title",
          description: "$quiz.description",
          pointsPerQuestion: "$quiz.pointsPerQuestion",
          durationPerQuestion: "$quiz.durationPerQuestion",
          questions: "$quiz.questions",
          updatedAt: "$quiz.updatedAt",
        },
        host: 1,
        participantCount: 1,
      },
    },
  ]).exec();

  return rows.map(toPublishedQuizResponse);
}

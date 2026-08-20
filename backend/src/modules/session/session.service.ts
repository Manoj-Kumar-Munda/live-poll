import { randomInt } from "node:crypto";
import { Quiz } from "@/modules/quiz/quiz.model.js";
import { QUIZ_STATUS } from "@/types/quiz.types.js";
import {
  PARTICIPANT_STATUS,
  type ParticipantStatus,
} from "@/types/quiz.types.js";
import { SESSION_STATUS } from "@/types/session.types.js";
import type { SessionStatus } from "@/types/session.types.js";
import { ApiError } from "@/shared/utils/api-error.js";
import {
  ROOM_CODE_CHARS,
  SESSION_LIMITS,
} from "./session.constants.js";
import { SessionParticipant, type SessionParticipantDocument } from "./participant.model.js";
import { Session, type SessionDocument } from "./session.model.js";
import type {
  CreateSessionInput,
  JoinSessionInput,
  ListSessionsQuery,
} from "./session.schema.js";
import type {
  SessionDetailResponse,
  SessionParticipantResponse,
  SessionResponse,
  SessionRoomState,
} from "./session.types.js";

const ACTIVE_SESSION_STATUSES: SessionStatus[] = [
  SESSION_STATUS.WAITING,
  SESSION_STATUS.LIVE,
];

function generateRoomCode() {
  let code = "";
  for (let index = 0; index < SESSION_LIMITS.roomCodeLength; index += 1) {
    code += ROOM_CODE_CHARS[randomInt(ROOM_CODE_CHARS.length)]!;
  }
  return code;
}

function getExpiresAt() {
  return new Date(
    Date.now() + SESSION_LIMITS.maxActiveHours * 60 * 60 * 1000,
  );
}

function assertSessionActive(session: SessionDocument) {
  if (session.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(410, "Session has expired");
  }

  if (session.status === SESSION_STATUS.FINISHED) {
    throw new ApiError(410, "Session has ended");
  }
}

function toParticipantResponse(
  participant: SessionParticipantDocument,
): SessionParticipantResponse {
  return {
    id: participant._id.toString(),
    userId: participant.userId,
    displayName: participant.displayName,
    status: participant.status as ParticipantStatus,
    score: participant.score,
    joinedAt: participant.joinedAt.toISOString(),
  };
}

async function getParticipantCount(sessionId: string) {
  return SessionParticipant.countDocuments({
    sessionId,
    status: PARTICIPANT_STATUS.ACTIVE,
  }).exec();
}

async function toSessionResponse(
  session: SessionDocument,
  quizTitle: string,
): Promise<SessionResponse> {
  const participantCount = await getParticipantCount(session._id.toString());

  return {
    id: session._id.toString(),
    quizId: session.quizId.toString(),
    quizTitle,
    hostId: session.hostId,
    roomCode: session.roomCode,
    status: session.status as SessionStatus,
    participantCount,
    currentQuestionIndex: session.currentQuestionIndex,
    questionEndsAt: session.questionEndsAt?.toISOString() ?? null,
    expiresAt: session.expiresAt.toISOString(),
    liveStartedAt: session.liveStartedAt?.toISOString() ?? null,
    finishedAt: session.finishedAt?.toISOString() ?? null,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

async function requireQuizForSession(hostId: string, quizId: string) {
  const quiz = await Quiz.findOne({ _id: quizId, ownerId: hostId }).exec();
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  if (quiz.status !== QUIZ_STATUS.PUBLISHED) {
    throw new ApiError(400, "Sessions can only be started on published quizzes");
  }

  return quiz;
}

async function requireSession(sessionId: string) {
  const session = await Session.findById(sessionId).exec();
  if (!session) {
    throw new ApiError(404, "Session not found");
  }
  return session as SessionDocument;
}

async function getQuizTitle(quizId: string) {
  const quiz = await Quiz.findById(quizId).select("title").exec();
  return quiz?.title ?? "Quiz";
}

async function listParticipants(sessionId: string) {
  const participants = await SessionParticipant.find({ sessionId })
    .sort({ joinedAt: 1 })
    .exec();

  return participants.map((participant) =>
    toParticipantResponse(participant as SessionParticipantDocument),
  );
}

async function emitSessionRoomUpdate(sessionId: string) {
  try {
    const { broadcastSessionState } = await import(
      "@/realtime/session.handlers.js"
    );
    await broadcastSessionState(sessionId);
  } catch {
    // Socket.IO may not be initialized (e.g. tests).
  }
}

export async function getSessionRoomState(
  sessionId: string,
): Promise<SessionRoomState> {
  const session = await requireSession(sessionId);
  const quizTitle = await getQuizTitle(session.quizId.toString());
  const base = await toSessionResponse(session, quizTitle);
  const participants = await listParticipants(sessionId);

  return {
    ...base,
    participants,
  };
}

async function buildSessionDetail(
  session: SessionDocument,
  role: "host" | "participant",
): Promise<SessionDetailResponse> {
  const quizTitle = await getQuizTitle(session.quizId.toString());
  const base = await toSessionResponse(session, quizTitle);
  const participants = await listParticipants(session._id.toString());

  return {
    ...base,
    role,
    participants,
  };
}

export async function createSession(
  hostId: string,
  input: CreateSessionInput,
): Promise<SessionDetailResponse> {
  const quiz = await requireQuizForSession(hostId, input.quizId);

  const existing = await Session.findOne({
    hostId,
    quizId: input.quizId,
    status: { $in: ACTIVE_SESSION_STATUSES },
  }).exec();

  if (existing) {
    throw new ApiError(
      409,
      "This quiz already has an active session. End it before starting a new one.",
    );
  }

  let session: SessionDocument | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      session = (await Session.create({
        quizId: quiz._id,
        hostId,
        roomCode: generateRoomCode(),
        status: SESSION_STATUS.WAITING,
        expiresAt: getExpiresAt(),
      })) as SessionDocument;
      break;
    } catch (error) {
      const isDuplicateRoomCode =
        error instanceof Error &&
        "code" in error &&
        (error as { code?: number }).code === 11000;

      if (!isDuplicateRoomCode || attempt === 4) {
        throw error;
      }
    }
  }

  if (!session) {
    throw new ApiError(500, "Failed to create session");
  }

  return buildSessionDetail(session, "host");
}

export async function listSessions(
  hostId: string,
  query: ListSessionsQuery,
): Promise<SessionResponse[]> {
  const filter: {
    hostId: string;
    quizId?: string;
    status?: SessionStatus;
  } = { hostId };

  if (query.quizId) {
    filter.quizId = query.quizId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const sessions = await Session.find(filter).sort({ createdAt: -1 }).exec();
  const quizIds = [...new Set(sessions.map((item) => item.quizId.toString()))];
  const quizzes = await Quiz.find({ _id: { $in: quizIds } })
    .select("title")
    .exec();
  const titleByQuizId = new Map(
    quizzes.map((quiz) => [quiz._id.toString(), quiz.title]),
  );

  return Promise.all(
    sessions.map((session) =>
      toSessionResponse(
        session as SessionDocument,
        titleByQuizId.get(session.quizId.toString()) ?? "Quiz",
      ),
    ),
  );
}

export async function getSessionById(
  userId: string,
  sessionId: string,
): Promise<SessionDetailResponse> {
  const session = await requireSession(sessionId);

  if (session.hostId === userId) {
    return buildSessionDetail(session, "host");
  }

  const participant = await SessionParticipant.findOne({
    sessionId,
    userId,
  }).exec();

  if (!participant) {
    throw new ApiError(403, "You do not have access to this session");
  }

  return buildSessionDetail(session, "participant");
}

export async function joinSession(
  userId: string,
  displayName: string,
  input: JoinSessionInput,
): Promise<SessionDetailResponse> {
  const session = await Session.findOne({
    roomCode: input.roomCode,
    status: SESSION_STATUS.WAITING,
  }).exec();

  if (!session) {
    throw new ApiError(404, "No waiting room found for that code");
  }

  assertSessionActive(session as SessionDocument);

  if (session.hostId === userId) {
    throw new ApiError(400, "Hosts cannot join their own session as a participant");
  }

  const name = displayName.trim() || "Player";

  const participant = await SessionParticipant.findOneAndUpdate(
    { sessionId: session._id, userId },
    {
      $setOnInsert: {
        sessionId: session._id,
        userId,
        displayName: name,
        status: PARTICIPANT_STATUS.ACTIVE,
        score: 0,
        joinedAt: new Date(),
      },
    },
    { upsert: true, new: true, runValidators: true },
  ).exec();

  if (participant && participant.status === PARTICIPANT_STATUS.QUIT) {
    participant.status = PARTICIPANT_STATUS.ACTIVE;
    participant.displayName = name;
    participant.joinedAt = new Date();
    await participant.save();
  }

  await emitSessionRoomUpdate(session._id.toString());
  return buildSessionDetail(session as SessionDocument, "participant");
}

export async function startSession(
  hostId: string,
  sessionId: string,
): Promise<SessionDetailResponse> {
  const session = await requireSession(sessionId);

  if (session.hostId !== hostId) {
    throw new ApiError(403, "Only the host can start this session");
  }

  assertSessionActive(session);

  const updated = await Session.findOneAndUpdate(
    { _id: sessionId, hostId, status: SESSION_STATUS.WAITING },
    {
      $set: {
        status: SESSION_STATUS.LIVE,
        liveStartedAt: new Date(),
      },
    },
    { new: true, runValidators: true },
  ).exec();

  if (!updated) {
    throw new ApiError(400, "Session can only be started from the waiting room");
  }

  await emitSessionRoomUpdate(sessionId);
  return buildSessionDetail(updated as SessionDocument, "host");
}

export async function endSession(
  hostId: string,
  sessionId: string,
): Promise<SessionDetailResponse> {
  const session = await requireSession(sessionId);

  if (session.hostId !== hostId) {
    throw new ApiError(403, "Only the host can end this session");
  }

  const finishedAt = new Date();

  const updated = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      hostId,
      status: { $in: ACTIVE_SESSION_STATUSES },
    },
    {
      $set: {
        status: SESSION_STATUS.FINISHED,
        finishedAt,
        questionEndsAt: null,
      },
    },
    { new: true, runValidators: true },
  ).exec();

  if (!updated) {
    throw new ApiError(400, "Session has already ended");
  }

  await SessionParticipant.updateMany(
    { sessionId, status: PARTICIPANT_STATUS.ACTIVE },
    { $set: { status: PARTICIPANT_STATUS.FINISHED } },
  ).exec();

  try {
    const { clearQuestionTimer } = await import("@/realtime/question.timer.js");
    clearQuestionTimer(sessionId);
  } catch {
    // Socket layer may not be initialized in tests.
  }

  await emitSessionRoomUpdate(sessionId);
  return buildSessionDetail(updated as SessionDocument, "host");
}

export async function leaveSession(
  userId: string,
  sessionId: string,
): Promise<SessionDetailResponse> {
  const session = await requireSession(sessionId);

  const participant = await SessionParticipant.findOne({
    sessionId,
    userId,
  }).exec();

  if (!participant) {
    throw new ApiError(404, "You are not in this session");
  }

  if (participant.status === PARTICIPANT_STATUS.QUIT) {
    return buildSessionDetail(session, "participant");
  }

  participant.status = PARTICIPANT_STATUS.QUIT;
  await participant.save();

  await emitSessionRoomUpdate(sessionId);
  return buildSessionDetail(session, "participant");
}

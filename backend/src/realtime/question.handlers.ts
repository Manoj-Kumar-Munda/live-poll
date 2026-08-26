import type { Socket } from "socket.io";
import { ApiError } from "@/shared/utils/api-error.js";
import { submitAnswerSchema } from "@/modules/session/answer.schema.js";
import { getUserAnswerForActiveQuestion, submitAnswer } from "@/modules/session/answer.service.js";
import { buildQuestionResults } from "@/modules/session/question.results.service.js";
import {
  getLeaderboardPayload,
  rebuildLeaderboard,
} from "@/modules/session/leaderboard.service.js";
import { scoreMcqQuestion } from "@/modules/session/score.service.js";
import { Session } from "@/modules/session/session.model.js";
import { SESSION_STATUS } from "@/types/session.types.js";
import {
  endCurrentQuestion,
  launchNextQuestion,
} from "@/modules/session/session.question.service.js";
import { getSessionById } from "@/modules/session/session.service.js";
import { broadcastSessionState } from "./session.handlers.js";
import { sessionRoomName } from "./session.room.js";
import { getSocketServer } from "./socket.server.js";
import {
  clearQuestionTimer,
  scheduleQuestionEnd,
} from "./question.timer.js";
import type {
  ClientToServerEvents,
  QuestionEndedPayload,
  LeaderboardUpdatedPayload,
  QuestionResultsPayload,
  QuestionStartedPayload,
  ServerToClientEvents,
  SocketData,
} from "./socket.types.js";

type QuestionSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

function socketErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export function broadcastQuestionStarted(payload: QuestionStartedPayload) {
  const io = getSocketServer();
  io.to(sessionRoomName(payload.sessionId)).emit("question:started", payload);
}

export function broadcastQuestionEnded(payload: QuestionEndedPayload) {
  const io = getSocketServer();
  io.to(sessionRoomName(payload.sessionId)).emit("question:ended", payload);
}

export function broadcastQuestionResults(payload: QuestionResultsPayload) {
  const io = getSocketServer();
  io.to(sessionRoomName(payload.sessionId)).emit("question:results", payload);
}

export function broadcastLeaderboardUpdated(payload: LeaderboardUpdatedPayload) {
  const io = getSocketServer();
  io.to(sessionRoomName(payload.sessionId)).emit("leaderboard:updated", payload);
}

async function emitQuestionResults(sessionId: string, questionIndex: number) {
  const results = await buildQuestionResults(sessionId, questionIndex);
  if (results) {
    broadcastQuestionResults(results);
  }
}

async function emitLeaderboard(sessionId: string, final = false) {
  const payload = await getLeaderboardPayload(sessionId, final);
  if (payload) {
    broadcastLeaderboardUpdated(payload);
  }
}

async function handleQuestionEnd(sessionId: string, reason: QuestionEndedPayload["reason"]) {
  const payload = await endCurrentQuestion(sessionId, reason);
  broadcastQuestionEnded(payload);
  await scoreMcqQuestion(sessionId, payload.index);
  await emitQuestionResults(sessionId, payload.index);
  await rebuildLeaderboard(sessionId);
  await emitLeaderboard(sessionId);
  await broadcastSessionState(sessionId);
}

async function handleQuestionTimerEnd(sessionId: string) {
  try {
    await handleQuestionEnd(sessionId, "timer");
  } catch {
    clearQuestionTimer(sessionId);
  }
}

export async function emitActiveQuestionToSocket(
  socket: QuestionSocket,
  sessionId: string,
) {
  const { getActiveQuestionPayload } = await import(
    "@/modules/session/session.question.service.js"
  );
  const payload = await getActiveQuestionPayload(sessionId);
  if (payload) {
    socket.emit("question:started", payload);

    const existingAnswer = await getUserAnswerForActiveQuestion(
      sessionId,
      socket.data.user.id,
    );
    if (existingAnswer) {
      socket.emit("question:answered", {
        sessionId,
        index: existingAnswer.index,
        value: existingAnswer.value,
      });
    }
    return;
  }

  const results = await (async () => {
    const session = await Session.findById(sessionId).exec();
    if (
      !session ||
      session.currentQuestionIndex < 0 ||
      session.questionEndsAt
    ) {
      return null;
    }

    return buildQuestionResults(sessionId, session.currentQuestionIndex);
  })();

  if (results) {
    socket.emit("question:results", results);
  }

  const session = await Session.findById(sessionId).exec();
  if (session) {
    const leaderboard = await getLeaderboardPayload(
      sessionId,
      session.status === SESSION_STATUS.FINISHED,
    );
    if (leaderboard) {
      socket.emit("leaderboard:updated", leaderboard);
    }
  }
}

export function registerQuestionHandlers(socket: QuestionSocket) {
  socket.on("question:launch", async () => {
    try {
      const sessionId = socket.data.liveSessionId;
      if (!sessionId) {
        throw new ApiError(400, "Join the session room first");
      }

      const detail = await getSessionById(socket.data.user.id, sessionId);
      if (detail.role !== "host") {
        throw new ApiError(403, "Only the host can launch questions");
      }

      const payload = await launchNextQuestion(socket.data.user.id, sessionId);
      scheduleQuestionEnd(sessionId, new Date(payload.endsAt), () =>
        handleQuestionTimerEnd(sessionId),
      );
      broadcastQuestionStarted(payload);
      await broadcastSessionState(sessionId);
    } catch (error) {
      socket.emit("session:error", { message: socketErrorMessage(error) });
    }
  });

  socket.on("question:end", async () => {
    try {
      const sessionId = socket.data.liveSessionId;
      if (!sessionId) {
        throw new ApiError(400, "Join the session room first");
      }

      const detail = await getSessionById(socket.data.user.id, sessionId);
      if (detail.role !== "host") {
        throw new ApiError(403, "Only the host can end questions");
      }

      clearQuestionTimer(sessionId);
      await handleQuestionEnd(sessionId, "host");
    } catch (error) {
      socket.emit("session:error", { message: socketErrorMessage(error) });
    }
  });

  socket.on("question:answer", async (payload) => {
    try {
      const sessionId = socket.data.liveSessionId;
      if (!sessionId) {
        throw new ApiError(400, "Join the session room first");
      }

      const detail = await getSessionById(socket.data.user.id, sessionId);
      if (detail.role !== "participant") {
        throw new ApiError(403, "Only participants can submit answers");
      }

      const { value } = submitAnswerSchema.parse(payload);
      const result = await submitAnswer(socket.data.user.id, sessionId, value);

      socket.emit("question:answered", {
        sessionId,
        index: result.index,
        value: result.value,
      });
    } catch (error) {
      socket.emit("session:error", { message: socketErrorMessage(error) });
    }
  });
}


export { clearQuestionTimer };
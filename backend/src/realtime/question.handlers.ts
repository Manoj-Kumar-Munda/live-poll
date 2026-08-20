import type { Socket } from "socket.io";
import { ApiError } from "@/shared/utils/api-error.js";
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

async function handleQuestionTimerEnd(sessionId: string) {
  try {
    const payload = await endCurrentQuestion(sessionId, "timer");
    broadcastQuestionEnded(payload);
    await broadcastSessionState(sessionId);
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
      const payload = await endCurrentQuestion(sessionId, "host");
      broadcastQuestionEnded(payload);
      await broadcastSessionState(sessionId);
    } catch (error) {
      socket.emit("session:error", { message: socketErrorMessage(error) });
    }
  });
}


export { clearQuestionTimer };
import type { Socket } from "socket.io";
import { ApiError } from "@/shared/utils/api-error.js";
import {
  getSessionById,
  getSessionRoomState,
} from "@/modules/session/session.service.js";
import type { SessionRoomState } from "@/modules/session/session.types.js";
import { getSocketServer } from "./socket.server.js";
import { sessionJoinPayloadSchema, sessionRoomName } from "./session.room.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socket.types.js";

type SessionSocket = Socket<
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

export async function broadcastSessionState(sessionId: string) {
  const io = getSocketServer();
  const state = await getSessionRoomState(sessionId);
  io.to(sessionRoomName(sessionId)).emit("session:state", state);
}

async function leaveLiveSession(socket: SessionSocket) {
  const sessionId = socket.data.liveSessionId;
  if (!sessionId) {
    return;
  }

  await socket.leave(sessionRoomName(sessionId));
  delete socket.data.liveSessionId;
}

export function registerSessionHandlers(socket: SessionSocket) {
  socket.on("session:join", async (payload) => {
    try {
      const { sessionId } = sessionJoinPayloadSchema.parse(payload);
      const detail = await getSessionById(socket.data.user.id, sessionId);

      await leaveLiveSession(socket);
      await socket.join(sessionRoomName(sessionId));
      socket.data.liveSessionId = sessionId;

      const state = await getSessionRoomState(sessionId);

      socket.emit("session:joined", {
        role: detail.role,
        state,
      });
      socket.to(sessionRoomName(sessionId)).emit("session:state", state);
    } catch (error) {
      socket.emit("session:error", { message: socketErrorMessage(error) });
    }
  });

  socket.on("session:leave", async () => {
    await leaveLiveSession(socket);
  });

  socket.on("disconnect", async () => {
    await leaveLiveSession(socket);
  });
}

export type { SessionRoomState };

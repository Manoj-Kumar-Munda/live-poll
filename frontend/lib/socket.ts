import { io, type Socket } from "socket.io-client";
import type {
  QuestionEndedPayload,
  QuestionStartedPayload,
  SessionRoomState,
} from "@/shared/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ClientToServerEvents = {
  "session:join": (payload: { sessionId: string }) => void;
  "session:leave": () => void;
  "question:launch": () => void;
  "question:end": () => void;
};

export type ServerToClientEvents = {
  connected: (payload: { userId: string; role: string }) => void;
  "session:joined": (payload: {
    role: "host" | "participant";
    state: SessionRoomState;
  }) => void;
  "session:state": (state: SessionRoomState) => void;
  "session:error": (payload: { message: string }) => void;
  "question:started": (payload: QuestionStartedPayload) => void;
  "question:ended": (payload: QuestionEndedPayload) => void;
};

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }

  return socket;
}

export function connectSocket() {
  const client = getSocket();
  if (!client.connected) {
    client.connect();
  }
  return client;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

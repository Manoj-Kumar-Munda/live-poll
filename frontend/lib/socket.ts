import { io, type Socket } from "socket.io-client";
import type {
  LeaderboardUpdatedPayload,
  QuestionAnsweredPayload,
  QuestionEndedPayload,
  QuestionResultsPayload,
  QuestionStartedPayload,
  SessionRoomState,
  WordCloudSnapshotPayload,
  WordCloudUpdatedPayload,
} from "@/shared/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ClientToServerEvents = {
  "session:join": (payload: { sessionId: string }) => void;
  "session:leave": () => void;
  "question:launch": () => void;
  "question:end": () => void;
  "question:answer": (payload: { value: string; sessionId?: string }) => void;
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
  "question:answered": (payload: QuestionAnsweredPayload) => void;
  "question:results": (payload: QuestionResultsPayload) => void;
  "leaderboard:updated": (payload: LeaderboardUpdatedPayload) => void;
  "wordcloud:updated": (payload: WordCloudUpdatedPayload) => void;
  "wordcloud:snapshot": (payload: WordCloudSnapshotPayload) => void;
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

import type { Session } from "@/lib/auth.js";
import type { UserRole } from "@/modules/auth/types.js";
import type { SessionRoomState } from "@/modules/session/session.types.js";

export type SocketUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type SocketSessionData = {
  user: SocketUser;
  session: Session["session"];
  liveSessionId?: string;
};

export type ClientToServerEvents = {
  "session:join": (payload: { sessionId: string }) => void;
  "session:leave": () => void;
};

export type ServerToClientEvents = {
  connected: (payload: { userId: string; role: UserRole }) => void;
  "session:joined": (payload: {
    role: "host" | "participant";
    state: SessionRoomState;
  }) => void;
  "session:state": (state: SessionRoomState) => void;
  "session:error": (payload: { message: string }) => void;
};

export type SocketData = SocketSessionData;

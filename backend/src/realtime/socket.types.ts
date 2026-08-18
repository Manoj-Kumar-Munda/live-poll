import type { Session } from "@/lib/auth.js";
import type { UserRole } from "@/modules/auth/types.js";

export type SocketUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type SocketSessionData = {
  user: SocketUser;
  session: Session["session"];
};

export type ClientToServerEvents = Record<string, never>;

export type ServerToClientEvents = {
  connected: (payload: { userId: string; role: UserRole }) => void;
};

export type SocketData = SocketSessionData;

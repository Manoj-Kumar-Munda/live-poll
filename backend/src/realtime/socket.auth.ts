import type { Request } from "express";
import type { Socket } from "socket.io";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth.js";
import { GUEST_COOKIE_NAME } from "@/modules/auth/guest-auth.js";
import { verifyGuestToken } from "@/modules/auth/guest-token.js";
import { isUserRole } from "@/modules/auth/types.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketUser,
} from "./socket.types.js";

type AuthenticatedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

function toSocketUser(user: {
  id: string;
  name: string;
  email: string;
  role?: string | null | undefined;
}): SocketUser {
  const role = user.role ?? "participant";

  if (!isUserRole(role)) {
    throw new Error("Invalid user role");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
  };
}

export async function authenticateSocket(
  socket: AuthenticatedSocket,
  next: (error?: Error) => void,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(socket.request.headers),
    });

    if (session) {
      socket.data.user = toSocketUser(session.user);
      socket.data.session = session.session;
      next();
      return;
    }

    const guestToken = (socket.request as Request).cookies?.[GUEST_COOKIE_NAME];

    if (guestToken) {
      const guest = await verifyGuestToken(guestToken);

      if (guest) {
        socket.data.user = {
          id: guest.sub,
          name: guest.name,
          email: guest.email,
          role: "participant",
        };
        next();
        return;
      }
    }

    next(new Error("Unauthorized"));
  } catch {
    next(new Error("Unauthorized"));
  }
}

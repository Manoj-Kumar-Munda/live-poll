import { createServer, type Server as HttpServer } from "node:http";
import cookieParser from "cookie-parser";
import type { Express } from "express";
import { Server } from "socket.io";
import { env } from "@/config/env.js";
import { authenticateSocket } from "./socket.auth.js";
import { registerQuestionHandlers } from "./question.handlers.js";
import { registerSessionHandlers } from "./session.handlers.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socket.types.js";

export type LivePollServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

let io: LivePollServer | null = null;

/**
 * Wraps the Express app in an HTTP server and attaches Socket.IO to it.
 * REST and realtime share the same port and process.
 */
export function createSocketServer(app: Express): {
  httpServer: HttpServer;
  io: LivePollServer;
} {
  const httpServer = createServer(app);

  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN ?? env.CLIENT_URL,
      credentials: true,
    },
  });

  io.engine.use(cookieParser());

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const { user } = socket.data;

    socket.emit("connected", {
      userId: user.id,
      role: user.role,
    });

    registerSessionHandlers(socket);
    registerQuestionHandlers(socket);

    socket.on("disconnect", () => {
      if (env.NODE_ENV === "development") {
        console.log(`Socket disconnected: ${user.id}`);
      }
    });
  });

  return { httpServer, io };
}

export function getSocketServer(): LivePollServer {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
}

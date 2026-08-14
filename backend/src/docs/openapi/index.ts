import { env } from "@/config/env.js";
import { components } from "./components.js";
import { paths } from "./paths.js";

/**
 * The API contract lives here instead of in controllers and routes so the
 * request-handling code remains focused on application behaviour.
 *
 * Add new paths in ./paths.ts (or split per module) as each API slice ships.
 */
export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "LivePoll API",
    version: "1.0.0",
    description:
      "HTTP API for LivePoll — live quizzes and polling.\n\n" +
      "Auth is handled by better-auth at `/api/auth/*` (cookie session). " +
      "Sign in via the frontend or better-auth client, then use the session cookie on protected routes.",
  },
  servers: [
    {
      url: env.BETTER_AUTH_URL,
      description: "Configured API server (BETTER_AUTH_URL)",
    },
  ],
  tags: [
    { name: "Health", description: "Service health" },
    { name: "Users", description: "Authenticated user profile" },
    { name: "Quizzes", description: "Quiz management (host)" },
  ],
  components,
  paths,
};

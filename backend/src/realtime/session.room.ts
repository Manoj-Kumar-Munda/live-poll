import { z } from "zod";

export const sessionJoinPayloadSchema = z.object({
  sessionId: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, "Invalid session id"),
});

export type SessionJoinPayload = z.infer<typeof sessionJoinPayloadSchema>;

export function sessionRoomName(sessionId: string) {
  return `session:${sessionId}`;
}

import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/config/env.js";
import { SESSION_LIMITS } from "@/modules/session/session.constants.js";

const GUEST_TOKEN_TTL = `${SESSION_LIMITS.maxActiveHours}h`;

export type GuestTokenPayload = {
  sub: string;
  name: string;
  email: string;
  sessionId: string;
  exp: number;
};

export type GuestTokenInput = Omit<GuestTokenPayload, "exp">;

export function isGuestUserId(userId: string) {
  return userId.startsWith("guest:");
}

export function createGuestUserId() {
  return `guest:${randomUUID()}`;
}

function getGuestJwtKey() {
  return new TextEncoder().encode(env.BETTER_AUTH_SECRET);
}

export async function signGuestToken(
  payload: GuestTokenInput,
): Promise<string> {
  return new SignJWT({
    name: payload.name,
    email: payload.email,
    sessionId: payload.sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(GUEST_TOKEN_TTL)
    .sign(getGuestJwtKey());
}

export async function verifyGuestToken(
  token: string,
): Promise<GuestTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getGuestJwtKey(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.sessionId !== "string" ||
      typeof payload.exp !== "number" ||
      !isGuestUserId(payload.sub)
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      sessionId: payload.sessionId,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

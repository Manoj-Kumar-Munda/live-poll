import type { NextFunction, Request, Response } from "express";
import { env } from "@/config/env.js";
import { SESSION_LIMITS } from "@/modules/session/session.constants.js";
import { ApiError } from "@/shared/utils/api-error.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { getSessionFromRequest } from "./middleware.js";
import {
  signGuestToken,
  verifyGuestToken,
  type GuestTokenInput,
} from "./guest-token.js";

export {
  createGuestUserId,
  isGuestUserId,
  type GuestTokenInput,
  type GuestTokenPayload,
} from "./guest-token.js";

export const GUEST_COOKIE_NAME = "livepoll_guest";

export async function getGuestTokenFromRequest(req: Request) {
  const token = req.cookies[GUEST_COOKIE_NAME];
  return token ? verifyGuestToken(token) : null;
}
export async function setGuestCookie(res: Response, payload: GuestTokenInput) {
  const token = await signGuestToken(payload);

  res.cookie(GUEST_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    maxAge: SESSION_LIMITS.maxActiveHours * 60 * 60 * 1000,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
  });
}

export function clearGuestCookie(res: Response) {
  res.clearCookie(GUEST_COOKIE_NAME, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
}

export const requireAuthOrGuest = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const session = await getSessionFromRequest(req);

    if (session) {
      req.session = session;
      req.user = session.user;
      req.isGuest = false;
      next();
      return;
    }

    const guest = await getGuestTokenFromRequest(req);

    if (!guest) {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = {
      id: guest.sub,
      name: guest.name,
      email: guest.email,
      role: "participant",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    req.guestSessionId = guest.sessionId;
    req.isGuest = true;
    next();
  },
);

export function requireParticipantOrGuest() {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }

      if (req.isGuest) {
        next();
        return;
      }

      const userRole = req.user.role as string | undefined;

      if (userRole !== "participant") {
        throw new ApiError(403, "Forbidden");
      }

      next();
    },
  );
}

export function assertGuestSessionAccess(req: Request, sessionId: string) {
  if (!req.isGuest) {
    return;
  }

  if (req.guestSessionId !== sessionId) {
    throw new ApiError(403, "You do not have access to this session");
  }
}

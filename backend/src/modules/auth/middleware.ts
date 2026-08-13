import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth.js";
import { ApiError } from "@/shared/utils/api-error.js";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import type { UserRole } from "./types.js";

export async function getSessionFromRequest(req: Request) {
  return auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
}

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const session = await getSessionFromRequest(req);

    if (!session) {
      throw new ApiError(401, "Unauthorized");
    }

    req.session = session;
    req.user = session.user;
    next();
  },
);

export function requireRole(role: UserRole) {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }

      const userRole = req.user.role as string | undefined;

      if (userRole !== role) {
        throw new ApiError(403, "Forbidden");
      }

      next();
    },
  );
}

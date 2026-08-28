import type { Session } from "@/modules/auth/auth.js";

declare global {
  namespace Express {
    interface Request {
      session?: Session;
      user?: Session["user"];
      isGuest?: boolean;
      guestSessionId?: string;
    }
  }
}

export {};

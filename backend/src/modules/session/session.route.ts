import { Router } from "express";
import { requireAuth, requireRole } from "@/modules/auth/middleware.js";
import {
  createSession,
  endSession,
  getSessionById,
  joinSession,
  leaveSession,
  listSessions,
  startSession,
} from "./session.controller.js";

const hostOnly = [requireAuth, requireRole("host")] as const;
const participantOnly = [requireAuth, requireRole("participant")] as const;
const anyAuth = [requireAuth] as const;

const router = Router();

router.post("/join", ...participantOnly, joinSession);
router.get("/", ...hostOnly, listSessions);
router.post("/", ...hostOnly, createSession);
router.get("/:sessionId", ...anyAuth, getSessionById);
router.post("/:sessionId/start", ...hostOnly, startSession);
router.post("/:sessionId/end", ...hostOnly, endSession);
router.post("/:sessionId/leave", ...participantOnly, leaveSession);

export default router;

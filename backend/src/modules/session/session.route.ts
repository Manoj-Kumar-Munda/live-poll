import { Router } from "express";
import { requireAuth, requireRole } from "@/modules/auth/middleware.js";
import {
  requireAuthOrGuest,
  requireParticipantOrGuest,
} from "@/modules/auth/guest-auth.js";
import {
  createSession,
  endSession,
  getHostDashboardStats,
  getSessionById,
  guestJoinSession,
  guestLogout,
  joinSession,
  leaveSession,
  listMySessions,
  listSessions,
  startSession,
} from "./session.controller.js";

const hostOnly = [requireAuth, requireRole("host")] as const;
const participantOnly = [requireAuth, requireRole("participant")] as const;

const router = Router();

router.post("/guest-join", guestJoinSession);
router.post("/guest-logout", guestLogout);
router.post("/join", ...participantOnly, joinSession);
router.get("/mine", ...participantOnly, listMySessions);
router.get("/stats", ...hostOnly, getHostDashboardStats);
router.get("/", ...hostOnly, listSessions);
router.post("/", ...hostOnly, createSession);
router.get("/:sessionId", requireAuthOrGuest, getSessionById);
router.post("/:sessionId/start", ...hostOnly, startSession);
router.post("/:sessionId/end", ...hostOnly, endSession);
router.post(
  "/:sessionId/leave",
  requireAuthOrGuest,
  requireParticipantOrGuest(),
  leaveSession,
);

export default router;

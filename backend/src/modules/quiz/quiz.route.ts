import { Router } from "express";
import { requireAuth, requireRole } from "@/modules/auth/middleware.js";
import { createQuiz, getQuizById, listQuizzes, updateQuizById } from "./quiz.controller.js";

const router = Router();
router.get("/", requireAuth, requireRole("host"), listQuizzes);
router.post("/", requireAuth, requireRole("host"), createQuiz);
router.get("/:id", requireAuth, requireRole("host"), getQuizById);
router.put("/:id", requireAuth, requireRole("host"), updateQuizById);

export default router;
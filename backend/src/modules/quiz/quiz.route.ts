import { Router } from "express";
import { requireAuth, requireRole } from "@/modules/auth/middleware.js";
import { createQuiz, listQuizzes } from "./quiz.controller.js";

const router = Router();

router.get("/", requireAuth, requireRole("host"), listQuizzes);
router.post("/", requireAuth, requireRole("host"), createQuiz);

export default router;

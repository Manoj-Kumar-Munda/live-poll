import { Router } from "express";
import { requireAuth, requireRole } from "@/modules/auth/middleware.js";
import { addQuestion, createQuiz, deleteQuizById, getQuizById, listQuizzes, updateQuizById } from "./quiz.controller.js";

const router = Router();
router.get("/", requireAuth, requireRole("host"), listQuizzes);
router.post("/", requireAuth, requireRole("host"), createQuiz);
router.post("/:quizId/questions", requireAuth, requireRole("host"), addQuestion);
router.get("/:quizId", requireAuth, requireRole("host"), getQuizById);
router.put("/:quizId", requireAuth, requireRole("host"), updateQuizById);
router.delete("/:quizId", requireAuth, requireRole("host"), deleteQuizById);

export default router;
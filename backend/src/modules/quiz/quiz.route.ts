import { Router } from "express";
import { requireAuth, requireRole } from "@/modules/auth/middleware.js";
import {
  addQuestion,
  archiveQuiz,
  createQuiz,
  deleteQuestion,
  deleteQuizById,
  getQuizById,
  listQuizzes,
  publishQuiz,
  updateQuestion,
  updateQuizById,
} from "./quiz.controller.js";

const hostOnly = [requireAuth, requireRole("host")] as const;

const router = Router();
router.get("/", ...hostOnly, listQuizzes);
router.post("/", ...hostOnly, createQuiz);
router.post("/:quizId/questions", ...hostOnly, addQuestion);
router.patch("/:quizId/questions/:questionId", ...hostOnly, updateQuestion);
router.delete("/:quizId/questions/:questionId", ...hostOnly, deleteQuestion);
router.post("/:quizId/publish", ...hostOnly, publishQuiz);
router.post("/:quizId/archive", ...hostOnly, archiveQuiz);
router.get("/:quizId", ...hostOnly, getQuizById);
router.put("/:quizId", ...hostOnly, updateQuizById);
router.delete("/:quizId", ...hostOnly, deleteQuizById);

export default router;

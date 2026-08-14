import { Router } from "express";
import { requireAuth, requireRole } from "@/modules/auth/middleware.js";
import { createQuiz } from "./quiz.controller.js";

const router = Router();

router.post("/", requireAuth, requireRole("host"), createQuiz);

export default router;

import { Router } from "express";
import { requireAuth } from "./middleware.js";
import { getUser, updateProfile } from "./user.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/me", getUser)
router.patch("/me", updateProfile);

export default router;

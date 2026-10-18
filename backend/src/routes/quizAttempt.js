import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";

import {
  submitQuizAttempt,
  getMyQuizAttempts,
} from "../controllers/quizAttemptController.js";

const router = express.Router();

router.post("/:quizId/submit", verifyToken, submitQuizAttempt);
router.get("/:quizId/mine", verifyToken, getMyQuizAttempts);

export default router;

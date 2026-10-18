import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import checkRole from "../middlewares/checkRoleMiddleware.js";

import {
  createQuiz,
  getPublishedQuizzes,
  getTeacherQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";

const router = express.Router();

// Profesor
router.post("/", verifyToken, checkRole(["teacher"]), createQuiz);

router.get(
  "/teacher/course/:courseId",
  verifyToken,
  checkRole(["teacher"]),
  getTeacherQuizzes
);

router.get(
  "/teacher/:id",
  verifyToken,
  checkRole(["teacher"]),
  getQuizById
);

router.put("/:id", verifyToken, checkRole(["teacher"]), updateQuiz);

router.delete("/:id", verifyToken, checkRole(["teacher"]), deleteQuiz);

// Estudiante autenticado
router.get(
  "/course/:courseId",
  verifyToken,
  getPublishedQuizzes
);

export default router;

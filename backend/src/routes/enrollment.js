import express from 'express';
const router = express.Router();
import { verifyToken } from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/checkRoleMiddleware.js';
import { getMyEnrollments, enrollInCourse,completeLesson } from '../controllers/enrollmentController.js';

router.get('/mine', verifyToken, checkRole(['student']), getMyEnrollments);
router.post('/:id',verifyToken, checkRole(['student']),enrollInCourse)
router.post('/:courseId/lessons/:lessonId/complete',verifyToken,checkRole(['student']),completeLesson
);

export default router
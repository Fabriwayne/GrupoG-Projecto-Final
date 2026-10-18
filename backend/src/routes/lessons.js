import express from 'express';
const router = express.Router();
import { updateLesson, deleteLesson, createLesson, getLessonsByCourse, getResourceLesson }
    from '../controllers/lessonController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/checkRoleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js'

router.post('/', verifyToken, checkRole(['teacher']), upload.array('resources', 5), createLesson);
router.get('/course/:courseId', verifyToken, getLessonsByCourse);
router.get("/:id/resources/:resourceIndex", verifyToken, getResourceLesson);
router.put('/:id', verifyToken, checkRole(['teacher']), upload.array('resources', 5), updateLesson);
router.delete('/:id', verifyToken, checkRole(['teacher']), deleteLesson);

export default router;

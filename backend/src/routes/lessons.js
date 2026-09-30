import express from 'express';
const router = express.Router();

import { updateLesson, deleteLesson } from '../controllers/lessonController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/checkRoleMiddleware.js';

router.put('/:id', verifyToken, checkRole(['teacher']), updateLesson);
router.delete('/:id', verifyToken, checkRole(['teacher']), deleteLesson);

export default router;

import express from 'express';
import {
    createChapter,
    getChaptersByCourse,
    updateChapter,
    deleteChapter
} from '../controllers/chapterController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/checkRoleMiddleware.js';

const router = express.Router();

router.get(
    '/course/:courseId',
    verifyToken,
    getChaptersByCourse
);

router.post(
    '/',
    verifyToken,
    checkRole(['teacher']),
    createChapter
);

router.put(
    '/:id',
    verifyToken,
    checkRole(['teacher']),
    updateChapter
);

router.delete(
    '/:id',
    verifyToken,
    checkRole(['teacher']),
    deleteChapter
);

export default router;
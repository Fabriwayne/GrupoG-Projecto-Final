import express from 'express';
const router = express.Router();

import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courseController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/checkRoleMiddleware.js';

import { getLessonsByCourse, createLesson } from '../controllers/lessonController.js';

// Rutas públicas (cualquier usuario autenticado puede ver los cursos)
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Rutas protegidas — solo profesores
router.post('/', verifyToken, checkRole(['teacher']), createCourse);
router.put('/:id', verifyToken, checkRole(['teacher']), updateCourse);
router.delete('/:id', verifyToken, checkRole(['teacher']), deleteCourse);

// Lecciones anidadas dentro de un curso
router.get('/:id/lessons', verifyToken, getLessonsByCourse);
router.post('/:id/lessons', verifyToken, checkRole(['teacher']), createLesson);

export default router;

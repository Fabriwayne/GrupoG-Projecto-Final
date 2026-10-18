import express from 'express';
import uploadImage from "../middlewares/uploadImagesMiddleware.js";
const router = express.Router();
import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getMyCourses,
    changeCourseStatus,
    getPublishedCourses
} from '../controllers/courseController.js';

import { verifyToken, optionalAuth } from '../middlewares/authMiddleware.js';
import checkRole from '../middlewares/checkRoleMiddleware.js';

// Rutas públicas (los borradores solo los ven su profesor y los estudiantes inscritos)
router.get('/', getCourses);
router.get('/mine', verifyToken, checkRole(['teacher']), getMyCourses);
router.get('/catalog', getPublishedCourses);
router.get('/:id', optionalAuth, getCourseById);

// Rutas protegidas — solo profesores
router.post('/', verifyToken, checkRole(['teacher']), uploadImage.single('image'), createCourse);
router.put('/:id', verifyToken, checkRole(['teacher']), uploadImage.single('image'), updateCourse);
router.patch('/:id/status', verifyToken, checkRole(['teacher']), changeCourseStatus);
router.delete('/:id', verifyToken, checkRole(['teacher']), deleteCourse);

export default router;

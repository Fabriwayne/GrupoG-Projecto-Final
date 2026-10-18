import mongoose from 'mongoose';
import Course from '../models/courseModel.js';
import Lesson from '../models/lessonModel.js';
import Chapter from '../models/chapterModel.js';
import Quiz from '../models/quizModel.js';
import QuizAttempt from '../models/quizAttemptModel.js';
import Enrollment from '../models/enrollmentModel.js';
import uploadImage from '../utils/uploadImage.js';
import { borrarArchivosCloudinary } from '../utils/cloudinaryFiles.js';

// GET /api/courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'published' }).populate('teacher', 'username email');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los cursos', error: error.message });
    }
};

// GET /api/courses/:id
const getCourseById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        const course = await Course.findById(req.params.id).populate('teacher', 'username email');
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        // Un borrador solo lo ven su profesor y los estudiantes que ya estaban inscritos
        if (course.status !== 'published') {
            const userId = req.user?.id;
            const esDueno = userId && String(course.teacher._id) === String(userId);
            const inscrito = userId && !esDueno
                ? await Enrollment.exists({ student: userId, course: course._id })
                : false;

            if (!esDueno && !inscrito) {
                return res.status(404).json({ message: 'Curso no encontrado' });
            }
        }

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el curso', error: error.message });
    }
};

const getMyCourses = async (req, res) => {
    try {
        const myCourses = await Course.find({ teacher: req.user.id })
        res.status(200).json(myCourses)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los cursos', error: error.message });
    }

};

const getPublishedCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            status: 'published'
        }).populate('teacher', 'username email');

        res.status(200).json(courses);

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener los cursos publicados',
            error: error.message
        });
    }
};

// POST /api/courses (requiere rol teacher)
const createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'El título y la descripción son obligatorios' });
        }

        const imageUrl = req.file ? await uploadImage(req.file.buffer) : "";

        const newCourse = await Course.create({
            title,
            description,
            image: imageUrl,
            teacher: req.user.id
        });

        res.status(201).json(newCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el curso', error: error.message });
    }
};

// PUT /api/courses/:id (requiere rol teacher y ser dueño del curso)
const updateCourse = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para editar este curso' });
        }

        const { title, description, status } = req.body;
        if (title) course.title = title;
        if (description) course.description = description;
        if (status) course.status = status

        if (req.file) {
            course.image = await uploadImage(req.file.buffer);
        }

        await course.save();
        res.status(200).json(course);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el curso', error: error.message });
    }
};

// DELETE /api/courses/:id (requiere rol teacher y ser dueño del curso)
const deleteCourse = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este curso' });
        }

        // Borrar todo lo que depende del curso para no dejar datos huérfanos
        const lecciones = await Lesson.find({ course: course._id }).select('resources');
        await borrarArchivosCloudinary(
            lecciones.flatMap((l) => l.resources.map((r) => r.publicId))
        );

        const quizzes = await Quiz.find({ course: course._id }).select('_id');
        await QuizAttempt.deleteMany({ quiz: { $in: quizzes.map((q) => q._id) } });
        await Quiz.deleteMany({ course: course._id });

        await Lesson.deleteMany({ course: course._id });
        await Chapter.deleteMany({ course: course._id });
        await Enrollment.deleteMany({ course: course._id });

        await course.deleteOne();

        res.status(200).json({ message: 'Curso eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el curso', error: error.message });
    }
};

// PATCH /api/courses/:id/status
const changeCourseStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        // Validar el estado recibido
        if (!['draft', 'published'].includes(status)) {
            return res.status(400).json({
                message: 'El estado debe ser draft o published'
            });
        }

        // Buscar el curso
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                message: 'Curso no encontrado'
            });
        }

        // Verificar que el profesor sea el propietario
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'No tienes permiso para cambiar el estado de este curso'
            });
        }

        // Actualizar el estado
        course.status = status;

        await course.save();

        res.status(200).json({
            message: status === 'published'
                ? 'Curso publicado correctamente'
                : 'Curso devuelto a borrador correctamente',
            course
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al cambiar el estado del curso',
            error: error.message
        });
    }
};

export {
    getCourses,
    getCourseById,
    getMyCourses,
    getPublishedCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    changeCourseStatus
};
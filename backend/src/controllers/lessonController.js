import Lesson from '../models/lessonModel.js';
import Course from '../models/courseModel.js';

// GET /api/courses/:id/lessons
const getLessonsByCourse = async (req, res) => {
    try {
        const lessons = await Lesson.find({ course: req.params.id }).sort({ orden: 1 });
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las lecciones', error: error.message });
    }
};

// POST /api/courses/:id/lessons (requiere rol teacher y ser dueño del curso)
const createLesson = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        if (course.teacher.toString() !== req.usuario.id) {
            return res.status(403).json({ message: 'No tienes permiso para agregar lecciones a este curso' });
        }

        const { title, content, orden } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'El título y el contenido son obligatorios' });
        }

        const newLesson = await Lesson.create({
            title,
            content,
            orden,
            course: course._id
        });

        res.status(201).json(newLesson);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear la lección', error: error.message });
    }
};

// PUT /api/lessons/:id (requiere rol teacher y ser dueño del curso de la lección)
const updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Lección no encontrada' });
        }

        if (lesson.course.teacher.toString() !== req.usuario.id) {
            return res.status(403).json({ message: 'No tienes permiso para editar esta lección' });
        }

        const { title, content, orden } = req.body;
        if (title) lesson.title = title;
        if (content) lesson.content = content;
        if (orden !== undefined) lesson.orden = orden;

        await lesson.save();
        res.status(200).json(lesson);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar la lección', error: error.message });
    }
};

// DELETE /api/lessons/:id (requiere rol teacher y ser dueño del curso de la lección)
const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Lección no encontrada' });
        }

        if (lesson.course.teacher.toString() !== req.usuario.id) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta lección' });
        }

        await lesson.deleteOne();
        res.status(200).json({ message: 'Lección eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la lección', error: error.message });
    }
};

export {
    getLessonsByCourse,
    createLesson,
    updateLesson,
    deleteLesson
};

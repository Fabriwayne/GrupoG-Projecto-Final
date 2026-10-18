import mongoose from 'mongoose';
import Enrollment from '../models/enrollmentModel.js';
import Chapter from '../models/chapterModel.js';
import Course from '../models/courseModel.js';
import Lesson from '../models/lessonModel.js';


// OBTENER CAPÍTULOS DE UN CURSO
const getChaptersByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { id: userId, role } = req.user;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: 'Curso no encontrado'
            });
        }

        const isOwner =
            role === 'teacher' &&
            course.teacher.toString() === userId;

        if (role === 'student') {
            const enrollment = await Enrollment.findOne({
                student: userId,
                course: courseId
            });

            if (!enrollment) {
                return res.status(403).json({
                    message: 'No estás inscrito en este curso'
                });
            }
        } else if (!isOwner) {
            return res.status(403).json({
                message: 'No tienes permiso para consultar estos capítulos'
            });
        }

        const chapters = await Chapter.find({
            course: courseId
        }).sort({ order: 1 });

        return res.status(200).json(chapters);

    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener los capítulos',
            error: error.message
        });
    }
};

// CREAR CAPÍTULO
const createChapter = async (req, res) => {
    try {
        const { title, description, course: courseId } = req.body;

        if (!title?.trim() || !courseId) {
            return res.status(400).json({
                message: 'El título y el curso son obligatorios'
            });
        }

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: 'Curso no encontrado'
            });
        }

        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'No tienes permiso para agregar capítulos a este curso'
            });
        }

        const ultimoCapitulo = await Chapter.findOne({
            course: courseId
        }).sort({ order: -1 });

        const siguienteOrden = ultimoCapitulo
            ? ultimoCapitulo.order + 1
            : 1;

        const nuevoCapitulo = await Chapter.create({
            title,
            description,
            course: courseId,
            order: siguienteOrden
        });

        return res.status(201).json(nuevoCapitulo);

    } catch (error) {
        return res.status(400).json({
            message: 'Error al crear el capítulo',
            error: error.message
        });
    }
};

// ACTUALIZAR CAPÍTULO
const updateChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'ID de capítulo inválido' });
        }

        const chapter = await Chapter.findById(id);

        if (!chapter) {
            return res.status(404).json({
                message: 'Capítulo no encontrado'
            });
        }

        const course = await Course.findById(chapter.course);

        if (!course) {
            return res.status(404).json({
                message: 'Curso no encontrado'
            });
        }

        if (
            req.user.role !== 'teacher' ||
            course.teacher.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: 'No tienes permiso para actualizar este capítulo'
            });
        }

        if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
                return res.status(400).json({
                    message: 'El título no puede estar vacío'
                });
            }

            chapter.title = title.trim();
        }

        if (description !== undefined) {
            chapter.description = description;
        }

        await chapter.save();

        return res.status(200).json({
            message: 'Capítulo actualizado correctamente',
            chapter
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el capítulo',
            error: error.message
        });
    }
};

// ELIMINAR CAPÍTULO
const deleteChapter = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'ID de capítulo inválido' });
        }

        const chapter = await Chapter.findById(id);

        if (!chapter) {
            return res.status(404).json({
                message: 'Capítulo no encontrado'
            });
        }

        const course = await Course.findById(chapter.course);

        if (!course) {
            return res.status(404).json({
                message: 'Curso no encontrado'
            });
        }

        if (
            req.user.role !== 'teacher' ||
            course.teacher.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: 'No tienes permiso para eliminar este capítulo'
            });
        }

        const tieneLecciones = await Lesson.exists({
            chapter: id
        });

        if (tieneLecciones) {
            return res.status(400).json({
                message: 'No puedes eliminar un capítulo que contiene lecciones'
            });
        }

        await chapter.deleteOne();

        return res.status(200).json({
            message: 'Capítulo eliminado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar el capítulo',
            error: error.message
        });
    }
};



export {
    getChaptersByCourse,
    createChapter,
    updateChapter,
    deleteChapter
};
import mongoose from 'mongoose';
import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js'
import Lesson from '../models/lessonModel.js'

const getMyEnrollments = async (req, res) => {
    try {
        const studentID = req.user.id

        const myCourses = await Enrollment.find({ student: studentID })
            .populate({
                path: 'course',
                select: 'title description image teacher',
                populate: {
                    path: 'teacher',
                    select: 'username'
                }
            });


        res.status(200).json(myCourses)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los cursos', error: error.message });
    }

}

const enrollInCourse = async (req, res) => {
    try {
        const courseID = req.params.id;
        const studentID = req.user.id;

        if (!mongoose.isValidObjectId(courseID)) {
            return res.status(400).json({ message: 'ID de curso inválido.' })
        }

        const course = await Course.findById(courseID)

        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado.' })
        }

        if (course.status !== 'published') {
            return res.status(400).json({ message: 'No se puede inscribir en este curso.' })
        }

        const inscrito = await Enrollment.findOne({
            student: studentID,
            course: courseID
        })

        if (inscrito) {
            return res.status(409).json({ message: 'Ya estas inscrito en este curso.' })
        }

        const nuevaInscripcion = await Enrollment.create({
            student: studentID,
            course: courseID
        })

        return res.status(201).json({
            message: 'Inscripción realizada correctamente.',
            enrollment: nuevaInscripcion
        });
    } catch (error) {
        // Dos clics seguidos: el índice único (student + course) rechaza el duplicado
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Ya estas inscrito en este curso.' })
        }

        return res.status(500).json({
            message: 'Error al realizar la inscripción.',
            error: error.message
        });
    }

}

const completeLesson = async (req, res) => {
    try {
        const studentID = req.user.id;
        const { courseId, lessonId } = req.params;

        if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lessonId)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }

        // Comprobar que el estudiante esté inscrito
        const enrollment = await Enrollment.findOne({
            student: studentID,
            course: courseId
        });

        if (!enrollment) {
            return res.status(403).json({
                message: 'No estás inscrito en este curso.'
            });
        }

        // Comprobar que la lección pertenezca al curso
        const lesson = await Lesson.findOne({
            _id: lessonId,
            course: courseId
        });

        if (!lesson) {
            return res.status(404).json({
                message: 'Lección no encontrada en este curso.'
            });
        }

        // Evitar registrar la misma lección varias veces
        if (!enrollment.completedLessons) {
            enrollment.completedLessons = [];
        }

        const yaCompletada = enrollment.completedLessons.some(
            id => id.toString() === lessonId
        );

        if (!yaCompletada) {
            enrollment.completedLessons.push(lesson._id);
        }

        // Calcular el progreso real
        const totalLecciones = await Lesson.countDocuments({
            course: courseId
        });

        const leccionesCompletadas = await Lesson.countDocuments({
            course: courseId,
            _id: { $in: enrollment.completedLessons }
        });

        enrollment.progress = totalLecciones > 0
            ? Math.round((leccionesCompletadas / totalLecciones) * 100)
            : 0;

        await enrollment.save();

        return res.status(200).json({
            message: 'Lección completada correctamente.',
            progress: enrollment.progress,
            completedLessons: enrollment.completedLessons
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error al completar la lección.',
            error: error.message
        });
    }
};

export {
    getMyEnrollments,
    enrollInCourse,
    completeLesson
}
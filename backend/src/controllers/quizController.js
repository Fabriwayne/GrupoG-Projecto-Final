import mongoose from "mongoose";
import Quiz from "../models/quizModel.js";
import Course from "../models/courseModel.js";
import Enrollment from "../models/enrollmentModel.js";

// Obtener el ID del usuario autenticado
const getUserId = (req) =>
  req.user?.id ?? req.user?._id ?? req.user?.userId;

// Comprobar que el profesor sea propietario del curso
const esPropietario = (curso, userId) =>
  curso && String(curso.teacher) === String(userId);

// CREAR QUIZ
export const createQuiz = async (req, res) => {
  try {
    const { title, description, course, questions, maxAttempts, published } = req.body;

    if (
      !title?.trim() ||
      !mongoose.isValidObjectId(course) ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message: "Título, curso y preguntas son obligatorios.",
      });
    }

    if (
      !Number.isInteger(maxAttempts) ||
      maxAttempts < 1
    ) {
      return res.status(400).json({
        message: "El número máximo de intentos debe ser al menos 1.",
      });
    }

    const curso = await Course.findById(course);

    if (!curso) {
      return res.status(404).json({
        message: "El curso no existe.",
      });
    }

    if (!esPropietario(curso, getUserId(req))) {
      return res.status(403).json({
        message: "No puedes crear evaluaciones en este curso.",
      });
    }

    for (const pregunta of questions) {
      if (
        !pregunta.question?.trim() ||
        !Array.isArray(pregunta.options) ||
        pregunta.options.length < 2 ||
        pregunta.options.some(
          (opcion) => typeof opcion !== "string" || !opcion.trim()
        ) ||
        !Number.isInteger(pregunta.correctAnswer) ||
        pregunta.correctAnswer < 0 ||
        pregunta.correctAnswer >= pregunta.options.length ||
        (pregunta.points !== undefined &&
          (!Number.isInteger(pregunta.points) || pregunta.points < 1))
      ) {
        return res.status(400).json({
          message: "Una o más preguntas tienen datos inválidos.",
        });
      }
    }

    const quiz = await Quiz.create({
      title,
      description,
      course,
      teacher: getUserId(req),
      questions,
      maxAttempts,
      published: published === true,
    });

    return res.status(201).json({
      message: "Evaluación creada correctamente.",
      quiz,
    });
  } catch (error) {
    console.error("Error al crear quiz:", error);
    return res.status(500).json({
      message: "Error al crear la evaluación.",
    });
  }
};

// LISTAR QUIZZES PUBLICADOS DE UN CURSO (ESTUDIANTE)
export const getPublishedQuizzes = async (req, res) => {
  try {
    const studentID = req.user.id;
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "ID de curso inválido." });
    }

    const enrollment = await Enrollment.findOne({
      student: studentID,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        message: 'No estás inscrito en este curso.'
      });
    }

    const quizzes = await Quiz.find({
      course: courseId,
      published: true,
    })
      .select("title description course maxAttempts questions createdAt")
      .lean();

    // No revelar las respuestas correctas.
    const seguros = quizzes.map((quiz) => ({
      ...quiz,
      questions: quiz.questions.map((pregunta) => ({
        _id: pregunta._id,
        question: pregunta.question,
        options: pregunta.options,
        points: pregunta.points,
      })),
    }));

    return res.json(seguros);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las evaluaciones.",
    });
  }
};

// LISTAR TODOS LOS QUIZZES DE UN CURSO (PROFESOR PROPIETARIO)
export const getTeacherQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "ID de curso inválido." });
    }

    const curso = await Course.findById(courseId);

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    if (!esPropietario(curso, getUserId(req))) {
      return res.status(403).json({
        message: "No puedes gestionar las evaluaciones de este curso.",
      });
    }

    const quizzes = await Quiz.find({ course: courseId })
      .sort({ createdAt: -1 });

    return res.json(quizzes);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las evaluaciones.",
    });
  }
};

// OBTENER UN QUIZ PARA EDICIÓN (PROFESOR)
export const getQuizById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de evaluación inválido." });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Evaluación no encontrada." });
    }

    if (String(quiz.teacher) !== String(getUserId(req))) {
      return res.status(403).json({
        message: "No puedes consultar esta evaluación.",
      });
    }

    return res.json(quiz);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener la evaluación.",
    });
  }
};

// EDITAR QUIZ
export const updateQuiz = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de evaluación inválido." });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Evaluación no encontrada." });
    }

    if (String(quiz.teacher) !== String(getUserId(req))) {
      return res.status(403).json({
        message: "No puedes editar esta evaluación.",
      });
    }

    // Evitar cambiar el curso o el propietario desde el cliente.
    const { title, description, questions, maxAttempts, published } =
      req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "El título es obligatorio." });
      }
      quiz.title = title;
    }

    if (description !== undefined) quiz.description = description;

    if (maxAttempts !== undefined) {
      if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
        return res.status(400).json({
          message: "El número máximo de intentos debe ser al menos 1.",
        });
      }

      // No permitir reducir el límite por debajo de intentos ya realizados.
      const QuizAttempt = (await import("../models/quizAttemptModel.js")).default;
      const usados = await QuizAttempt.countDocuments({ quiz: quiz._id });

      if (maxAttempts < usados) {
        return res.status(400).json({
          message: "No puedes establecer un límite inferior a los intentos ya realizados.",
        });
      }

      quiz.maxAttempts = maxAttempts;
    }

    if (questions !== undefined) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          message: "El quiz debe tener al menos una pregunta.",
        });
      }

      for (const pregunta of questions) {
        if (
          !pregunta.question?.trim() ||
          !Array.isArray(pregunta.options) ||
          pregunta.options.length < 2 ||
          pregunta.options.some(
            (opcion) => typeof opcion !== "string" || !opcion.trim()
          ) ||
          !Number.isInteger(pregunta.correctAnswer) ||
          pregunta.correctAnswer < 0 ||
          pregunta.correctAnswer >= pregunta.options.length ||
          (pregunta.points !== undefined &&
            (!Number.isInteger(pregunta.points) || pregunta.points < 1))
        ) {
          return res.status(400).json({
            message: "Una o más preguntas tienen datos inválidos.",
          });
        }
      }

      quiz.questions = questions;
    }

    if (published !== undefined) {
      if (typeof published !== "boolean") {
        return res.status(400).json({
          message: "El estado de publicación no es válido.",
        });
      }
      quiz.published = published;
    }

    await quiz.save();

    return res.json({
      message: "Evaluación actualizada correctamente.",
      quiz,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar la evaluación.",
    });
  }
};

// ELIMINAR QUIZ
export const deleteQuiz = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID de evaluación inválido." });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Evaluación no encontrada." });
    }

    if (String(quiz.teacher) !== String(getUserId(req))) {
      return res.status(403).json({
        message: "No puedes eliminar esta evaluación.",
      });
    }

    const QuizAttempt = (await import("../models/quizAttemptModel.js")).default;

    // Borrar también los intentos asociados para no dejar resultados huérfanos.
    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();

    return res.json({ message: "Evaluación eliminada correctamente." });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar la evaluación.",
    });
  }
};

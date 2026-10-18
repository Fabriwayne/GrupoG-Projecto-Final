import mongoose from "mongoose";
import Quiz from "../models/quizModel.js";
import QuizAttempt from "../models/quizAttemptModel.js";
import Enrollment from "../models/enrollmentModel.js";

const getUserId = (req) =>
  req.user?.id ?? req.user?._id ?? req.user?.userId;

// ENVIAR Y CORREGIR UN INTENTO
export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const studentId = getUserId(req);

    if (req.user?.role !== "student") {
      return res.status(403).json({
        message: "Solo los estudiantes pueden realizar evaluaciones.",
      });
    }

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({ message: "ID de evaluación inválido." });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "Debes enviar las respuestas del examen.",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz || !quiz.published) {
      return res.status(404).json({
        message: "Evaluación no encontrada o no disponible.",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: quiz.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "Debes estar inscrito en el curso para realizar esta evaluación.",
      });
    }

    // Contar los intentos ya guardados.
    const intentosUsados = await QuizAttempt.countDocuments({
      quiz: quiz._id,
      student: studentId,
    });

    if (intentosUsados >= quiz.maxAttempts) {
      return res.status(403).json({
        message: "Has alcanzado el límite de intentos de esta evaluación.",
      });
    }

    // Exigir una respuesta válida para cada pregunta, sin duplicados.
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        message: "Debes responder todas las preguntas.",
      });
    }

    const idsEnviados = new Set();

    for (const answer of answers) {
      if (
        !answer ||
        !mongoose.isValidObjectId(answer.questionId) ||
        !Number.isInteger(answer.selectedAnswer) ||
        answer.selectedAnswer < 0
      ) {
        return res.status(400).json({
          message: "Una o más respuestas no son válidas.",
        });
      }

      const questionId = String(answer.questionId);

      if (idsEnviados.has(questionId)) {
        return res.status(400).json({
          message: "No puedes enviar respuestas duplicadas.",
        });
      }

      idsEnviados.add(questionId);
    }

    const preguntas = new Map(
      quiz.questions.map((pregunta) => [
        String(pregunta._id),
        pregunta,
      ])
    );

    // Comprobar que las respuestas pertenecen a este quiz.
    for (const answer of answers) {
      const pregunta = preguntas.get(String(answer.questionId));

      if (
        !pregunta ||
        answer.selectedAnswer >= pregunta.options.length
      ) {
        return res.status(400).json({
          message: "Una respuesta no corresponde a esta evaluación.",
        });
      }
    }

    let score = 0;
    let totalPoints = 0;

    const respuestasCorregidas = answers.map((answer) => {
      const pregunta = preguntas.get(String(answer.questionId));
      const isCorrect =
        answer.selectedAnswer === pregunta.correctAnswer;

      const puntos = pregunta.points ?? 1;
      totalPoints += puntos;

      const pointsEarned = isCorrect ? puntos : 0;
      score += pointsEarned;

      return {
        questionId: pregunta._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        pointsEarned,
      };
    });

    const attemptNumber = intentosUsados + 1;
    const percentage = Math.round((score / totalPoints) * 100);

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: studentId,
      attemptNumber,
      answers: respuestasCorregidas,
      score,
      totalPoints,
      percentage,
    });

    return res.status(201).json({
      message: "Evaluación enviada correctamente.",
      result: {
        attemptId: attempt._id,
        attemptNumber,
        score,
        totalPoints,
        percentage,
        answers: respuestasCorregidas,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    // El índice único evita repetir el mismo número de intento.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "El intento ya fue registrado. Actualiza tus resultados.",
      });
    }

    console.error("Error al enviar quiz:", error);

    return res.status(500).json({
      message: "Error al corregir la evaluación.",
    });
  }
};

// CONSULTAR MIS INTENTOS
export const getMyQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.isValidObjectId(quizId)) {
      return res.status(400).json({ message: "ID de evaluación inválido." });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz || !quiz.published) {
      return res.status(404).json({
        message: "Evaluación no encontrada.",
      });
    }

    const enrollment = await Enrollment.findOne({
      student: getUserId(req),
      course: quiz.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "No estás inscrito en este curso.",
      });
    }

    const attempts = await QuizAttempt.find({
      quiz: quizId,
      student: getUserId(req),
    })
      .select("-answers")
      .sort({ attemptNumber: -1 });

    return res.json({
      maxAttempts: quiz.maxAttempts,
      attemptsUsed: attempts.length,
      attemptsRemaining: Math.max(0, quiz.maxAttempts - attempts.length),
      attempts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al consultar tus resultados.",
    });
  }
};
import { request } from "./api";
const RUTA = "/api/quiz-attempts";

// ESTUDIANTE: enviar las respuestas y recibir la calificación
const enviarEvaluacion = (quizId, answers) =>
    request(`${RUTA}/${quizId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
    });

// ESTUDIANTE: consultar el historial y los intentos restantes
const obtenerMisIntentos = (quizId) =>
    request(`${RUTA}/${quizId}/mine`);

export {
    enviarEvaluacion,
    obtenerMisIntentos,
};

import { request } from "./api";
const RUTA = "/api/quizzes";

// PROFESOR: crear una evaluación
const crearEvaluacion = (datos) =>
    request(`${RUTA}/`, {
        method: "POST",
        body: JSON.stringify(datos),
    });

// PROFESOR: obtener todas las evaluaciones de un curso
const obtenerEvaluacionesProfesor = (courseId) =>
    request(`${RUTA}/teacher/course/${courseId}`);

// PROFESOR: obtener una evaluación por su ID
const obtenerEvaluacionPorId = (quizId) =>
    request(`${RUTA}/teacher/${quizId}`);

// PROFESOR: actualizar una evaluación
const actualizarEvaluacion = (quizId, datos) =>
    request(`${RUTA}/${quizId}`, {
        method: "PUT",
        body: JSON.stringify(datos),
    });

// PROFESOR: publicar o despublicar una evaluación
const cambiarEstadoEvaluacion = (quizId, published) =>
    actualizarEvaluacion(quizId, { published });

// PROFESOR: eliminar una evaluación
const eliminarEvaluacion = (quizId) =>
    request(`${RUTA}/${quizId}`, {
        method: "DELETE",
    });

// ESTUDIANTE: obtener las evaluaciones publicadas de un curso
const obtenerEvaluacionesPublicadas = (courseId) =>
    request(`${RUTA}/course/${courseId}`);

export {
    crearEvaluacion,
    obtenerEvaluacionesProfesor,
    obtenerEvaluacionPorId,
    actualizarEvaluacion,
    cambiarEstadoEvaluacion,
    eliminarEvaluacion,
    obtenerEvaluacionesPublicadas,
};

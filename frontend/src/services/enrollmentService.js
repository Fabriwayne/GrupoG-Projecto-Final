import { request } from "./api";
const RUTA = "/api/enrollments";

const inscribirseEnCurso = (cursoId) =>
    request(`${RUTA}/${cursoId}`, { method: "POST" });

const obtenerMisInscripciones = () =>
    request(`${RUTA}/mine`);

const completarLeccion = (courseId, lessonId) =>
    request(`${RUTA}/${courseId}/lessons/${lessonId}/complete`, {
        method: "POST"
    })

export {
    inscribirseEnCurso,
    obtenerMisInscripciones,
    completarLeccion
};
import { request } from "./api";
const RUTA = "/api/chapters";

// Crear un capítulo
const crearCapitulo = (datos) =>
    request(`${RUTA}/`, {
        method: "POST",
        body: JSON.stringify(datos)
    });

// Obtener los capítulos de un curso
const obtenerCapitulosPorCurso = (courseId) =>
    request(`${RUTA}/course/${courseId}`);

const actualizarCapitulo = (id, datos) =>
    request(`${RUTA}/${id}`, {
        method: "PUT",
        body: JSON.stringify(datos)
    });

const eliminarCapitulo = (id) =>
    request(`${RUTA}/${id}`, {
        method: "DELETE"
    });

export {
    obtenerCapitulosPorCurso,
    crearCapitulo,
    actualizarCapitulo,
    eliminarCapitulo
}

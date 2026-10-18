import { request } from "./api";
const RUTA = "/api/courses";

const obtenerCursos = () => request(RUTA);

const obtenerCursoPorID = (id) =>
    request(`${RUTA}/${id}`);

const obtenerMisCursos = () =>
    request(`${RUTA}/mine`);

const obtenerCursoPublicados = () =>
    request(`${RUTA}/catalog`);

const eliminarCurso = (id) =>
    request(`${RUTA}/${id}`, { method: "DELETE" });

const CambiarEstadoCurso = (id, estado) =>
    request(`${RUTA}/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: estado }) })

const guardarCurso = (datos) => {
    const formData = new FormData();

    formData.append("title", datos.title);
    formData.append("description", datos.description);

    if (datos.image) {
        formData.append("image", datos.image);
    }

    return request(RUTA, {
        method: "POST",
        body: formData
    });
}

const actualizarCurso = (id, datos) => {
    const formData = new FormData();

    formData.append("title", datos.title);
    formData.append("description", datos.description);

    if (datos.image) {
        formData.append("image", datos.image);
    }

    return request(`${RUTA}/${id}`,
        { method: "PUT", body: formData });
}


export {
    obtenerCursos,
    obtenerCursoPublicados,
    obtenerCursoPorID,
    obtenerMisCursos,
    guardarCurso,
    actualizarCurso,
    eliminarCurso,
    CambiarEstadoCurso
}
import { request } from "./api";
const RUTA = "/api/lessons";

const obtenerLecciones = (cursoID) =>
    request(`${RUTA}/course/${cursoID}`);

const crearLeccion = (datos) => {
    const formData = new FormData();

    formData.append("title", datos.title);
    formData.append("content", datos.content);
    formData.append("course", datos.course);

    if (datos.videoURL) {
        formData.append("videoURL", datos.videoURL);
    }

    if (datos.chapter) {
        formData.append("chapter", datos.chapter);
    }

    for (const archivo of (datos.resources || [])) {
        formData.append("resources", archivo);
    }

    return request(RUTA, {
        method: "POST",
        body: formData
    });
};

const actualizarLeccion = (id, datos) => {
    const formData = new FormData();

    formData.append("title", datos.title);
    formData.append("content", datos.content);
    formData.append("videoURL", datos.videoURL || "");

    if (datos.file) {
        formData.append("resources", datos.file);
    }

    return request(`${RUTA}/${id}`, { method: "PUT", body: formData });
};

const eliminarLeccion = (id) =>
    request(`${RUTA}/${id}`, { method: "DELETE" });

export {
    obtenerLecciones,
    crearLeccion,
    actualizarLeccion,
    eliminarLeccion
};
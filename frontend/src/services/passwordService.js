import { request } from "./api";

const RUTA = "/api/auth";

const actualizarPerfil = (id, datos) =>
    request(`${RUTA}/${id}`, { method: "PUT", body: JSON.stringify(datos) });

const cambiarPassword = (id, datos) =>
    request(`${RUTA}/${id}/change-password`, { method: "PUT", body: JSON.stringify(datos) });

const solicitarRecuperacion = (email) =>
    request(`${RUTA}/forgot-password`, { method: "POST", body: JSON.stringify({ email }) });

export {
    actualizarPerfil,
    cambiarPassword,
    solicitarRecuperacion
}
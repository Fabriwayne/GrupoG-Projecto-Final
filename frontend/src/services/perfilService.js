import { request } from "./api";
const RUTA = "/api/auth/me";

const obtenerUserActual = () => request(RUTA);

const actualizarUserActual = (datos) =>
  request(RUTA, {
    method: "PUT",
    body: JSON.stringify(datos)
  });

export { obtenerUserActual, actualizarUserActual };
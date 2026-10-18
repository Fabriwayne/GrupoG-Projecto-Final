import { request } from "./api";
const RUTA = "/api/auth";

const registerUser = (usuario) =>
    request(`${RUTA}/register`, {
        method: "POST",
        body: JSON.stringify(usuario)
    });

const loginUser = (datos) =>
    request(`${RUTA}/login`, {
        method: "POST",
        body: JSON.stringify(datos)
    });

const logoutUser = () =>
    request(`${RUTA}/logout`, {
        method: "POST"
    });

export {
    registerUser,
    loginUser,
    logoutUser
}
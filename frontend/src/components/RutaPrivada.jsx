import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { obtenerUserActual } from "../services/perfilService";
import { ui } from "./Stat";

export default function RutaPrivada({ roles, children }) {
    const [estado, setEstado] = useState("cargando");

    // "roles" llega como un array nuevo en cada render; usamos su contenido como dependencia
    const clave = roles ? roles.join(",") : "";

    useEffect(() => {
        let activo = true;
        const permitidos = clave ? clave.split(",") : null;

        obtenerUserActual()
            .then((usuario) => {
                if (activo) setEstado(!permitidos || permitidos.includes(usuario.role) ? "ok" : "sin-permiso");
            })
            .catch((err) => {
                if (activo) setEstado(err.status === 401 || err.status === 403 ? "sin-sesion" : "error");
            });

        return () => {
            activo = false;
        };
    }, [clave]);

    if (estado === "cargando")
        return (<div className={ui.estado}><div><div className={ui.spinner} />Verificando tu sesión...</div></div>);
    if (estado === "sin-sesion") return <Navigate to="/login" replace />;
    if (estado === "sin-permiso") return <Navigate to="/dashboard" replace />;
    if (estado === "error")
        return (<div className={ui.estado}><p className={ui.errorCaja}>
            No pudimos verificar tu sesión. Revisa tu conexión e inténtalo de nuevo.</p></div>
        );
    return children;
}
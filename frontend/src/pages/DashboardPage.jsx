import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard.jsx";
import { ui } from "../components/Stat";
import { obtenerUserActual, actualizarUserActual } from "../services/perfilService.js";
import { logoutUser } from "../services/authServices.js";
import { obtenerMisCursos } from "../services/cursosService.js";
import { obtenerMisInscripciones } from "../services/enrollmentService.js";

export default function DashboardPage() {
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [error, setError] = useState("");
    const [cursos, setCursos] = useState(null);
    const [inscripciones, setInscripciones] = useState([]);

    // 1) Quién es el usuario (también nos dice si hay sesión)
    useEffect(() => {
        async function cargarPerfil() {
            try {
                setCargando(true);
                const user = await obtenerUserActual();
                setUsuario(user);

                if (user.role === "teacher") {
                    const misCursos = await obtenerMisCursos();
                    setCursos(misCursos);
                } else {
                    const misInscripciones =
                        await obtenerMisInscripciones();

                    setInscripciones(misInscripciones);
                }
            } catch (err) {
                if (err.status === 401 || err.status === 403) {
                    navigate("/login");
                } else {
                    setError(
                        "No pudimos cargar tu panel. Revisa tu conexión e inténtalo de nuevo."
                    );
                    console.error(err);
                }
            } finally {
                setCargando(false);
                setCargandoDatos(false);
            }
        }

        cargarPerfil();
    }, [navigate]);

    const actualizarPerfil = async (datos) => {
        const actualizado = await actualizarUserActual(datos);
        setUsuario(actualizado);
    };

    const cerrarSesion = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.log(err.message);
        } finally {
            navigate("/login"); // aunque falle el backend, sacamos al usuario de la pantalla
        }
    };

    if (cargando)
        return (
            <div className={ui.estado}>
                <div>
                    <div className={ui.spinner} />
                    Cargando tu panel…
                </div>
            </div>
        );
    if (error)
        return (
            <div className={ui.estado}>
                <p className={ui.errorCaja}>{error}</p>
            </div>
        );
    if (!usuario) return null;

    return (
        <Dashboard
            usuario={usuario}
            cursos={cursos ?? []}
            inscripciones={inscripciones}
            cargando={cargandoDatos}
            tareas={[]}
            onActualizarPerfil={actualizarPerfil}
            onCrearCurso={() => navigate("/cursos/nuevo")}
            onGestionarCurso={(curso) => navigate(`/cursos/${curso._id}`)}
            onAbrirCurso={(curso) => navigate(`/aprender/${curso._id}`)}
            onCerrarSesion={cerrarSesion}
        />
    );
}

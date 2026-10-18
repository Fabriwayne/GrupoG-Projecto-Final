
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    obtenerCursoPublicados
} from "../services/cursosService";
import {
    inscribirseEnCurso,
    obtenerMisInscripciones
} from "../services/enrollmentService";
import CatalogoCursos from "../components/CatalogoCursos";

export default function CatalogoPage() {
    const [cursos, setCursos] = useState([]);
    const [inscritosIds, setInscritosIds] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function cargarDatos() {
            try {
                setCargando(true);
                setError("");

                const [cursosPublicados, inscripciones] =
                    await Promise.all([
                        obtenerCursoPublicados(),
                        obtenerMisInscripciones()
                    ]);

                setCursos(Array.isArray(cursosPublicados) ? cursosPublicados : []);

                const ids = inscripciones
                    .filter((inscripcion) => inscripcion.course)
                    .map((inscripcion) =>
                        String(inscripcion.course._id)
                    );

                setInscritosIds(ids);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        }

        cargarDatos();
    }, []);

    const manejarInscripcion = async (curso) => {
        await inscribirseEnCurso(curso._id);

        setInscritosIds((anteriores) => [
            ...anteriores,
            String(curso._id)
        ]);
    };

    return (
        <CatalogoCursos
            cursos={cursos}
            inscritosIds={inscritosIds}
            cargando={cargando}
            error={error}
            onInscribirse={manejarInscripcion}
            onVolver={() => navigate("/dashboard")}
        />
    );
}

import { useNavigate, useParams } from "react-router-dom";
import GestionarCurso from "../components/GestionarCurso";
import { useEffect, useState } from "react";
import { actualizarCurso, eliminarCurso, obtenerCursoPorID, CambiarEstadoCurso } from "../services/cursosService";
import { actualizarLeccion, crearLeccion, eliminarLeccion, obtenerLecciones } from "../services/leccionesService";
import { obtenerCapitulosPorCurso, crearCapitulo, actualizarCapitulo, eliminarCapitulo } from "../services/chapterServices";
import { obtenerEvaluacionesProfesor } from "../services/quizService";

export default function GestionarCursoPage() {
    const { id } = useParams();
    const [curso, setCurso] = useState();
    const [cargando, setCargando] = useState(true);

    const [capitulos, setCapitulos] = useState([]);
    const [cargandoCapitulos, setCargandoCapitulos] = useState(true);

    const [lecciones, setLecciones] = useState([]);
    const [cargandoLecciones, setCargandoLecciones] = useState(true);

    const [quizzes, setQuizzes] = useState([]);

    const [error, setError] = useState("");
    const [errorLecciones, setErrorLecciones] = useState("");
    const navigate = useNavigate()

    useEffect(() => {
        async function cargarCurso() {
            setCargando(true)
            setError("")
            try {
                const datos = await obtenerCursoPorID(id)
                setCurso(datos)
            } catch (err) {
                setError(err.message)
            } finally {
                setCargando(false)
            }
        }
        cargarCurso()
    }, [id])

    useEffect(() => {
        async function cargarLecciones() {
            setCargandoLecciones(true)
            setErrorLecciones("")
            try {
                const datos = await obtenerLecciones(id);
                setLecciones(Array.isArray(datos) ? datos : []);
            } catch (err) {
                setErrorLecciones(err.message)
            } finally {
                setCargandoLecciones(false)
            }
        }
        cargarLecciones()
    }, [id])

    useEffect(() => {
        async function cargarCapitulos() {
            try {
                setCargandoCapitulos(true);
                const datos = await obtenerCapitulosPorCurso(id);
                setCapitulos(Array.isArray(datos) ? datos : []);
            } catch (err) {
                console.error("Error al cargar capítulos:", err);
            } finally {
                setCargandoCapitulos(false);
            }
        }

        cargarCapitulos();
    }, [id]);

    useEffect(() => {
        async function cargarQuizzes() {
            try {
                const datos = await obtenerEvaluacionesProfesor(id);
                setQuizzes(Array.isArray(datos) ? datos : []);
            } catch (err) {
                console.error("Error al cargar los quizzes:", err);
            }
        }

        cargarQuizzes();
    }, [id]);

    async function onGuardar({ title, description, image }) {
        await actualizarCurso(id, { title, description, image })
        navigate(0)
    }

    async function onEliminar() {
        await eliminarCurso(id)
        navigate('/dashboard', { replace: true })
    }

    async function onCambiarEstado(nuevoEstado) {
        await CambiarEstadoCurso(id, nuevoEstado)
        navigate(0, { replace: true })
    }

    //--CAPITULOS-------------------------------------------------------------------------------------------------------------------------
    async function onCrearCapitulo({ title, description }) {
        try {
            const nuevo = await crearCapitulo({
                title,
                description,
                course: id
            });

            setCapitulos((prev) => [...prev, nuevo]);
        } catch (error) {
            console.error("Error al crear el capítulo:", error);
            throw error;
        }
    }

    async function onActualizarCapitulo(id, datos) {
        const respuesta = await actualizarCapitulo(id, datos);

        const capituloActualizado = respuesta.chapter;

        setCapitulos((prev) =>
            prev.map((capitulo) =>
                capitulo._id === id ? capituloActualizado : capitulo
            )
        );
    }

    async function onEliminarCapitulo(id) {
        await eliminarCapitulo(id)
        setCapitulos((prev) =>
            prev.filter((capitulo) => capitulo._id !== id)
        );
    }

    ///LECCIONES-------------------------------------------------------------------------------------------------------------------------

    async function onCrearLeccion(chapterId, { title, content, videoURL, file }) {
        const nueva = await crearLeccion({
            title,
            content,
            videoURL,
            course: id,
            chapter: chapterId,
            resources: file ? [file] : []
        });

        setLecciones((prev) => [...prev, nueva]);
    }

    async function onActualizarLeccion(idLeccion, datos) {
        const actualizada = await actualizarLeccion(idLeccion, datos)
        setLecciones((prev) => prev.map((leccion) => (leccion._id === idLeccion ? actualizada : leccion)))
    }

    async function onEliminarLeccion(idLeccion) {
        await eliminarLeccion(idLeccion);
        setLecciones((prev) => prev.filter((leccion) => leccion._id !== idLeccion))
    }
    return (
        <GestionarCurso
            curso={curso}
            cargando={cargando}
            error={error}
            errorContenido={errorLecciones}
            quizzes={quizzes}
            onAgregarQuiz={() =>
                navigate(`/profesor/cursos/${id}/quizzes/nuevo`, { state: { cursoTitulo: curso?.title } })
            }
            onEditarQuiz={(quiz) =>
                navigate(`/profesor/cursos/${id}/quizzes/${quiz._id}/editar`, { state: { cursoTitulo: curso?.title } })
            }
            onGuardar={onGuardar}
            onEliminar={onEliminar}
            onVolver={() => navigate("/dashboard")}
            onCambiarEstado={(nuevoEstado) => onCambiarEstado(nuevoEstado)}
            capitulos={capitulos}
            lecciones={lecciones}
            cargandoContenido={cargandoCapitulos}
            onCrearCapitulo={onCrearCapitulo}
            onActualizarCapitulo={onActualizarCapitulo}
            onEliminarCapitulo={onEliminarCapitulo}
            cargandoLecciones={cargandoLecciones}
            onCrearLeccion={onCrearLeccion}
            onActualizarLeccion={onActualizarLeccion}
            onEliminarLeccion={onEliminarLeccion}
        />
    )
}
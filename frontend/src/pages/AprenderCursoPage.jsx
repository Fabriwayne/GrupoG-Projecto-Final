import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AprenderCurso from "../components/AprenderCurso";
import { obtenerCursoPorID } from "../services/cursosService";
import { obtenerLecciones } from "../services/leccionesService";
import { obtenerCapitulosPorCurso } from "../services/chapterServices";
import {
  obtenerMisInscripciones,
  completarLeccion,
} from "../services/enrollmentService";
import { obtenerEvaluacionesPublicadas } from "../services/quizService";

export default function AprenderCursoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [capitulos, setCapitulos] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  // null = el usuario no está inscrito (por ejemplo, un profesor viendo su curso): no hay progreso que guardar
  const [cargando, setCargando] = useState(true);
  const [leccionesCompletadas, setLeccionesCompletadas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setError("");

      try {
        const [cursoData, leccionesData, capitulosData] = await Promise.all([
          obtenerCursoPorID(id),
          obtenerLecciones(id),
          obtenerCapitulosPorCurso(id),
        ]);

        // Datos opcionales: si fallan (por ejemplo, para un profesor) la pantalla sigue funcionando
        const [inscripciones, quizzesData] = await Promise.allSettled([
          obtenerMisInscripciones(),
          obtenerEvaluacionesPublicadas(id),
        ]);

        if (cancelado) return;

        setCurso(cursoData);
        setLeccionesCompletadas(setLecciones(Array.isArray(leccionesData) ? leccionesData : []));
        setCapitulos(Array.isArray(capitulosData) ? capitulosData : []);
        const miInscripcion =
          inscripciones.status === "fulfilled" && Array.isArray(inscripciones.value)
            ? inscripciones.value.find((i) => String(i.course?._id) === String(id))
            : null;
        setLeccionesCompletadas(miInscripcion ? (miInscripcion.completedLessons ?? []).map(String) : null);

        setQuizzes(
          quizzesData.status === "fulfilled" && Array.isArray(quizzesData.value) ? quizzesData.value : []
        );
      } catch (err) {
        if (cancelado) return;

        setError(err.message || "No se pudo cargar el curso. Inténtalo de nuevo.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [id]);

  const marcarCompletada = async (leccion) => {
    const respuesta = await completarLeccion(id, leccion._id);
    setLeccionesCompletadas((respuesta.completedLessons ?? []).map(String));
  };

  return (
    <AprenderCurso
      curso={curso}
      capitulos={capitulos}
      lecciones={lecciones}
      quizzes={quizzes}
      cargando={cargando}
      error={error}
      leccionesCompletadas={leccionesCompletadas ?? []}
      onCompletarLeccion={leccionesCompletadas !== null ? marcarCompletada : undefined}
      onAbrirQuiz={(quiz) => navigate(`/cursos/${id}/quizzes/${quiz._id}`)}
      onVolver={() => navigate("/dashboard")}
    />
  );
}

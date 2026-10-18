import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TomarQuiz from "../components/TomarQuiz";
import { obtenerEvaluacionesPublicadas } from "../services/quizService";
import { enviarEvaluacion, obtenerMisIntentos } from "../services/quizAttemptService";

// Ruta: /cursos/:id/quizzes/:quizId
export default function TomarQuizPage() {
  const { id, quizId } = useParams(); // id = curso
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [intentos, setIntentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        // No hay endpoint "un quiz publicado por id" para el estudiante, así que se busca
        // en la lista de publicados del curso (GET /quizzes/course/:courseId)
        const [publicados, misIntentos] = await Promise.all([
          obtenerEvaluacionesPublicadas(id),
          obtenerMisIntentos(quizId), // GET /attempts/:quizId/mine
        ]);
        if (!activo) return;

        const encontrado = (Array.isArray(publicados) ? publicados : []).find(
          (q) => String(q._id) === String(quizId)
        );
        setQuiz(encontrado ?? null); // null -> TomarQuiz muestra "No encontramos este quiz."
        setIntentos(
          Array.isArray(misIntentos?.attempts) ? misIntentos.attempts : []
        );
      } catch (err) {
        if (activo) setError(err.message || "No se pudo cargar el quiz.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [id, quizId]);

  const enviar = async (respuestas) => {
    const respuesta = await enviarEvaluacion(quizId, respuestas);

    // El controlador devuelve los datos dentro de "result".
    const intento = respuesta.result;

    if (!intento) {
      throw new Error("El servidor no devolvió el resultado de la evaluación.");
    }

    setIntentos((prev) => [...prev, intento]);

    return intento;
  };

  return (
    <TomarQuiz
      quiz={quiz}
      intentos={intentos}
      cargando={cargando}
      error={error}
      onEnviar={enviar}
      onVolver={() => navigate(`/aprender/${id}`)}
    />
  );
}
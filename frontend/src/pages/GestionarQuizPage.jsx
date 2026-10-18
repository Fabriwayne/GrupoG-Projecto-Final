import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import QuizEditor from "../components/QuizEditor";

import {
    crearEvaluacion,
    obtenerEvaluacionPorId,
    actualizarEvaluacion,
    eliminarEvaluacion,
} from "../services/quizService";

export default function QuizEditorPage() {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const esEdicion = Boolean(quizId);

    const cursoTitulo = location.state?.cursoTitulo ?? "";

    const [quiz, setQuiz] = useState(null);
    const [cargando, setCargando] = useState(esEdicion);
    const [error, setError] = useState("");

    // Cargar la evaluación cuando estamos editando
    useEffect(() => {
        if (!esEdicion) {
            setQuiz(null);
            setCargando(false);
            return;
        }

        let activo = true;

        const cargarQuiz = async () => {
            setCargando(true);
            setError("");

            try {
                const data = await obtenerEvaluacionPorId(quizId);

                if (activo) {
                    setQuiz(data);
                }
            } catch (err) {
                if (activo) {
                    setError(
                        err.message ||
                        "No se pudo cargar la evaluación."
                    );
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        };

        cargarQuiz();

        return () => {
            activo = false;
        };
    }, [quizId, esEdicion]);

    // Crear o actualizar la evaluación
    const guardarQuiz = async (datos) => {
        if (esEdicion) {
            await actualizarEvaluacion(quizId, datos);
        } else {
            await crearEvaluacion({
                ...datos,
                course: courseId,
            });
        }

        // Volver a la pantalla anterior cuando se guarde correctamente
        navigate(-1);
    };

    // Eliminar la evaluación
    const borrarQuiz = async () => {
        await eliminarEvaluacion(quizId);
        navigate(-1);
    };

    // Regresar al curso
    const volverAlCurso = () => {
        navigate(-1);
    };

    return (
        <QuizEditor
            quiz={quiz}
            cursoTitulo={cursoTitulo}
            cargando={cargando}
            error={error}
            onGuardar={guardarQuiz}
            onEliminar={esEdicion ? borrarQuiz : undefined}
            onVolver={volverAlCurso}
        />
    );
}

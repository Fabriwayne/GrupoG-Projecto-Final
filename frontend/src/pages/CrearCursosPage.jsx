import { useNavigate } from "react-router-dom";
import CrearCursoForm from "../components/CrearCursoForm.jsx";
import { guardarCurso } from "../services/cursosService.js";

export default function CrearCursoPage() {
    const navigate = useNavigate()

    const onCrear = async ({ title, description, image }) => {

        await guardarCurso({ title, description, image })
        navigate(0)

    }

    return (
        <CrearCursoForm onCrear={onCrear} onCancelar={() => navigate("/dashboard")} />
    )
}
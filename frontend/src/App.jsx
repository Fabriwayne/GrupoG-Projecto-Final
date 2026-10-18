import { BrowserRouter, Routes, Route } from "react-router-dom"

import Inicio from "./pages/Inicio"
import Registro from "./pages/Registro"
import Login from "./pages/Login"
import PerfilPage from "./pages/PerfilPage"
import DashboardPage from "./pages/DashboardPage"
import CrearCursoPage from "./pages/CrearCursosPage"
import GestionarCursoPage from "./pages/GestionarCursoPage"
import CatalogoPage from "./pages/CatalogoPage"
import AprenderCursoPage from "./pages/AprenderCursoPage";
import QuizEditorPage from "./pages/GestionarQuizPage";
import TomarQuizPage from "./pages/TomarQuizPage";
import OlvidePassword from "./pages/OlvidePasswordPage";

import RutaPrivada from "./components/RutaPrivada"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<OlvidePassword />} />

        {/* Rutas Privadas Protegidas de Ambos */}
        <Route path="/dashboard" element={<RutaPrivada><DashboardPage /></RutaPrivada>} />
        <Route path="/perfil" element={<RutaPrivada><PerfilPage /></RutaPrivada>} />
        <Route path="/cursos/nuevo" element={<RutaPrivada roles={["teacher"]}><CrearCursoPage /></RutaPrivada>} />
        <Route path="/cursos/:id" element={<RutaPrivada roles={["teacher"]}><GestionarCursoPage /></RutaPrivada>} />
        <Route path="/catalogo" element={<RutaPrivada  roles={["student"]}><CatalogoPage /></RutaPrivada>} />
        <Route path="/aprender/:id" element={<RutaPrivada><AprenderCursoPage /></RutaPrivada>} />
        <Route path="/profesor/cursos/:courseId/quizzes/nuevo" element={<RutaPrivada roles={["teacher"]}><QuizEditorPage /></RutaPrivada>} />
        <Route path="/profesor/cursos/:courseId/quizzes/:quizId/editar" element={<RutaPrivada roles={["teacher"]}><QuizEditorPage /></RutaPrivada>} />
        <Route path="/cursos/:id/quizzes/:quizId" element={<RutaPrivada roles={["student"]}><TomarQuizPage /></RutaPrivada>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
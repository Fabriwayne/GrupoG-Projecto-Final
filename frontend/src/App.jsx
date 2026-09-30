import { BrowserRouter, Routes, Route } from "react-router-dom"

import Inicio from "./pages/Inicio"
import Registro from "./pages/Registro"
import Login from "./pages/Login"
import PerfilProfesor from "./pages/PerfilProfesor"
import PerfilEstudiante from "./pages/PerfilEstudiante"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil-teacher" element={<PerfilProfesor />} />
        <Route path="/perfil-student" element={<PerfilEstudiante />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
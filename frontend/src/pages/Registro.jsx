import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authServices.js"
import { AuthLayout, Burbuja, sinGloboDelNavegador, traducirError, ui } from "../components/Stat";

// Correo con texto antes y después de la @ y un punto en el dominio (nombre@correo.com)
const PATRON_CORREO = "[^@\\s]+@[^@\\s]+\\.[^@\\s]+";
const PATRON_USERNAME = "@?[a-zA-Z0-9_\-]{3,30}";

function Registro() {

  const navigate = useNavigate()
  const [formulario, setFormulario] = useState({
    username: "",
    email: "",
    password: "",
    role: ""
  })
  // Error que devuelve el servidor: { campo, texto } o null
  const [errorServidor, setErrorServidor] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await registerUser(formulario)
      navigate('/login')

    } catch (error) {
      console.log(error.message)
      setErrorServidor(traducirError(error.message))
    }

  }

  // Al escribir de nuevo se quita el error del servidor
  const cambiar = (campo, valor) => {
    setFormulario({ ...formulario, [campo]: valor })
    setErrorServidor(null)
  }

  const errorEn = (campo) => errorServidor?.campo === campo

  // Burbuja del servidor si el error es de este campo; si no, la del navegador (solo si está mal escrito)
  const burbuja = (campo, ayuda) =>
    errorEn(campo) ? (
      <Burbuja role="alert">{errorServidor.texto}</Burbuja>
    ) : (
      <Burbuja className={ui.burbujaCampo}>{ayuda}</Burbuja>
    )

  return (
    <AuthLayout
      titulo="Crear cuenta"
      subtitulo="Regístrate para comenzar."
      pie={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}
    >
      <form onSubmit={handleSubmit} className="grid gap-4.5">

        <label className={ui.campo}>
          <span>Username</span>
          <input
            type="text"
            placeholder="@tu_usuario"
            className={ui.input}
            value={formulario.username}
            onChange={(e) => cambiar("username", e.target.value)}
            required
            pattern={PATRON_USERNAME}
            minLength={3}
            onInvalid={sinGloboDelNavegador}
            aria-invalid={errorEn("username") || undefined}
          />
          {burbuja("username", "Escribe un nombre de usuario de al menos 3 caracteres.")}
        </label>

        <label className={ui.campo}>
          <span>Correo electrónico</span>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            className={ui.input}
            value={formulario.email}
            onChange={(e) => cambiar("email", e.target.value)}
            required
            pattern={PATRON_CORREO}
            onInvalid={sinGloboDelNavegador}
            aria-invalid={errorEn("email") || undefined}
          />
          {burbuja("email", "Escribe un correo válido, por ejemplo nombre@correo.com")}
        </label>

        <label className={ui.campo}>
          <span>Contraseña</span>
          <input
            type="password"
            placeholder="••••••••"
            className={ui.input}
            value={formulario.password}
            onChange={(e) => cambiar("password", e.target.value)}
            required
            minLength={8}
            onInvalid={sinGloboDelNavegador}
            aria-invalid={errorEn("password") || undefined}
          />
          {burbuja("password", "La contraseña debe tener al menos 8 caracteres.")}
        </label>

        <label className={ui.campo}>
          <span>Tipo de usuario</span>
          <select
            className={ui.input}
            value={formulario.role}
            onChange={(e) => cambiar("role", e.target.value)}
            required
            onInvalid={sinGloboDelNavegador}
          >
            <option value="">
              Selecciona un rol
            </option>
            <option value="student">
              Estudiante
            </option>

            <option value="teacher">
              Profesor
            </option>
          </select>
          {burbuja("role", "Elige si eres estudiante o profesor.")}
        </label>

        {errorServidor && !errorServidor.campo && <p className={`${ui.error} mb-0!`} role="alert">{errorServidor.texto}</p>}

        <button type="submit" className={`${ui.btnPrimarioGrande} mt-2 w-full`}>
          Registrarme
        </button>

      </form>
    </AuthLayout>

  )
}

export default Registro

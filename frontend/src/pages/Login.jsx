import { useState } from "react"
import { loginUser } from "../services/authServices.js";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout, Burbuja, sinGloboDelNavegador, traducirError, ui } from "../components/Stat";

// Correo con texto antes y después de la @ y un punto en el dominio (nombre@correo.com)
const PATRON_CORREO = "[^@\\s]+@[^@\\s]+\\.[^@\\s]+"

function Login() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState({
    email: "",
    password: ""
  })
  // Error que devuelve el servidor: { campo, texto } o null
  const [errorServidor, setErrorServidor] = useState(null)

  const handleOnSubmit = async (e) => {
    e.preventDefault()

    try {
      await loginUser(datos)
      navigate('/dashboard')

    } catch (error) {
      console.log(error.message)
      setErrorServidor(traducirError(error.message))
    }
  }

  // Al escribir de nuevo se quita el error del servidor
  const cambiar = (campo, valor) => {
    setDatos({ ...datos, [campo]: valor })
    setErrorServidor(null)
  }

  const errorEn = (campo) => errorServidor?.campo === campo

  return (
    <AuthLayout
      titulo="Bienvenido de nuevo"
      subtitulo="Inicia sesión para continuar."
      pie={<>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></>}
    >
      <form onSubmit={handleOnSubmit} className="grid gap-4.5">

        <label className={ui.campo}>
          <span>Correo electrónico</span>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            className={ui.input}
            value={datos.email}
            onChange={(e) => cambiar("email", e.target.value)}
            required
            pattern={PATRON_CORREO}
            onInvalid={sinGloboDelNavegador}
            aria-invalid={errorEn("email") || undefined}
          />
          {errorEn("email") ? (
            <Burbuja role="alert">{errorServidor.texto}</Burbuja>
          ) : (
            <Burbuja className={ui.burbujaCampo}>
              Escribe un correo válido, por ejemplo nombre@correo.com
            </Burbuja>
          )}
        </label>

        <label className={ui.campo}>
          <span>Contraseña</span>
          <input
            type="password"
            placeholder="••••••••"
            className={ui.input}
            value={datos.password}
            onChange={(e) => cambiar("password", e.target.value)}
            required
            onInvalid={sinGloboDelNavegador}
            aria-invalid={errorEn("password") || undefined}
          />
          {errorEn("password") ? (
            <Burbuja role="alert">{errorServidor.texto}</Burbuja>
          ) : (
            <Burbuja className={ui.burbujaCampo}>Escribe tu contraseña.</Burbuja>
          )}
        </label>

        {errorServidor && !errorServidor.campo && <p className={`${ui.error} mb-0!`} role="alert">{errorServidor.texto}</p>}

        <div className="text-right">
          <Link to="/forgot-password" className="text-xs font-semibold text-acento hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button type="submit" className={`${ui.btnPrimarioGrande} mt-2 w-full`}>
          Iniciar sesión
        </button>

      </form>
    </AuthLayout>
  )
}

export default Login
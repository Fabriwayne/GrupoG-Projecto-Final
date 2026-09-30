import { useState } from "react"
import { loginUser } from "../services/authServices.js";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState({
    email: "",
    password: ""
  })

  const handleOnSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = await loginUser(datos)

      if (data.user.role === 'student') {
        navigate("/perfil-student");
      } else if (data.user.role === 'teacher') {
        navigate("/perfil-teacher");
      }

    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

      <form onSubmit={handleOnSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido de nuevo
        </h1>

        <p className="text-gray-500 mb-8">
          Inicia sesión para continuar.
        </p>

        <div className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={datos.email}
              onChange={(e) => setDatos({ ...datos, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={datos.password}
              onChange={(e) => setDatos({ ...datos, password: e.target.value })}
            />
          </div>

        </div>

        <button
          type="submit"
          className="w-full mt-8 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Iniciar sesión
        </button>

      </form>

    </main>
  )
}

export default Login
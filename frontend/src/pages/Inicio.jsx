import { Link } from "react-router-dom"

function Inicio() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-6">

      <div className="max-w-2xl text-center">

        <p className="text-indigo-600 font-bold text-lg mb-4">
          EduConnect
        </p>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Aprende, Enseña y{" "}
          <span className="text-indigo-600">
            conecta.
          </span>
        </h1>

        <p className="text-gray-600 text-lg leading-relaxed mb-10">
          Una plataforma donde profesores y estudiantes
          pueden aprender, compartir y crecer juntos.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">

          <Link
            to="/registro"
            className="bg-indigo-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Registrarme
          </Link>

          <Link
            to="/login"
            className="border border-indigo-600 text-indigo-600 px-7 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition"
          >
            Iniciar sesión
          </Link>

        </div>

      </div>

    </main>
  )
}

export default Inicio
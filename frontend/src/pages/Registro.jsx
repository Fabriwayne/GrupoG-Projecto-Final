import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authServices.js"

function Registro() {

  const navigate = useNavigate()
  const [formulario, setFormulario] = useState({
    username: "",
    email: "",
    password: "",
    role: ""
  })

  const handleSubmit = async (e)=>{
    e.preventDefault()
    try {
      const data = await registerUser(formulario)
      navigate('/login')
      
    } catch (error) {
      console.log(error.message)
    }
    
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear cuenta
        </h1>

        <p className="text-gray-500 mb-8">
          Regístrate para comenzar.
        </p>

        <div className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>

            <input
              type="text"
              placeholder="@tugatica_losmina"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formulario.username}
              onChange={(e)=>setFormulario({...formulario, username: e.target.value})}
            />  
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formulario.email}
              onChange={(e)=>setFormulario({...formulario, email: e.target.value})}
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
              value={formulario.password}
              onChange={(e)=>setFormulario({...formulario, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de usuario
            </label>

            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formulario.role}
              onChange={(e)=>setFormulario({...formulario, role: e.target.value})}
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
          </div>

        </div>

        <button
          type="submit"
          className="w-full mt-8 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Registrarme
        </button>

      </form>
      {console.log(formulario)}
    </main>
    
  )
}

export default Registro
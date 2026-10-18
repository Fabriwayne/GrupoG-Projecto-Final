import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Perfil from "../components/Perfil.jsx";
import { ui } from "../components/Stat";
import { obtenerUserActual, actualizarUserActual } from "../services/perfilService.js";
import { cambiarPassword } from "../services/passwordService.js";
import { logoutUser } from "../services/authServices.js";

export default function PerfilPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerUserActual()
      .then(setUsuario)
      .catch((err) => {
        if (err.status === 401 || err.status === 403) {
          navigate("/login");
        } else {
          setError("No pudimos cargar tu perfil. Revisa tu conexión e inténtalo de nuevo.");
        }
      })
      .finally(() => setCargando(false));
  }, [navigate]);

  const actualizarPerfil = async (datos) => {
    const actualizado = await actualizarUserActual(datos);
    setUsuario(actualizado);
  };

  const manejarCambioPassword = async (datosPassword) => {
    // Dispara la petición pasándole el ID de la sesión y el cuerpo del formulario
    await cambiarPassword(usuario._id, datosPassword);
  };

  const cerrarSesion = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.log(err.message);
    } finally {
      navigate("/login"); // aunque falle el backend, sacamos al usuario de la pantalla
    }
  };

  if (cargando)
    return (
      <div className={ui.estado}>
        <div>
          <div className={ui.spinner} />
          Cargando perfil…
        </div>
      </div>
    );
  if (error)
    return (
      <div className={ui.estado}>
        <p className={ui.errorCaja}>{error}</p>
      </div>
    );
  if (!usuario) return null;

  return (
    <Perfil
      usuario={usuario}
      onActualizarPerfil={actualizarPerfil}
      onCerrarSesion={cerrarSesion}
      onCambiarPassword={manejarCambioPassword}
    />
  );
}

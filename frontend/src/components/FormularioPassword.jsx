import { useState } from "react";
import { ui } from "./Stat";

export default function FormularioPassword() {
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const manejarCambioPassword = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setExito("");

    if (nuevoPassword !== confirmarPassword) {
      setError("La nueva contraseña y la confirmación no coinciden.");
      setGuardando(false);
      return;
    }

    try {
      // Aquí irá la llamada a tu API, por ejemplo:
      // await cambiarPasswordService({ passwordActual, nuevoPassword });
      setExito("Contraseña actualizada correctamente.");
      setPasswordActual("");
      setNuevoPassword("");
      setConfirmarPassword("");
    } catch (err) {
      setError(err.message || "Error al actualizar la contraseña.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className={`${ui.bloque} ${ui.form}`}>
      <h2>Cambiar contraseña</h2>
      <form onSubmit={manejarCambioPassword} className="grid gap-4">
        <label>
          Contraseña actual
          <input 
            type="password" 
            value={passwordActual} 
            onChange={(e) => setPasswordActual(e.target.value)} 
            required
          />
        </label>

        <label>
          Nueva contraseña
          <input 
            type="password" 
            value={nuevoPassword} 
            onChange={(e) => setNuevoPassword(e.target.value)} 
            required 
          />
        </label>

        <label>
          Confirmar nueva contraseña
          <input 
            type="password" 
            value={confirmarPassword} 
            onChange={(e) => setConfirmarPassword(e.target.value)} 
            required 
          />
        </label>

        {error && <p className={ui.error}>{error}</p>}
        {exito && <p className={ui.exito} style={{ color: "green" }}>{exito}</p>}

        <button className={ui.btn} type="submit" disabled={guardando}>
          {guardando ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>
    </section>
  );
}

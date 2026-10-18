import { useState } from "react";

export default function OlvidePassword() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError("");
    setMensaje("");

    try {
      // await solicitarRecuperacionService(email);
      setMensaje("Te hemos enviado un enlace de recuperación a tu correo electrónico.");
    } catch (err) {
      setError(err.message || "No se pudo procesar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-container">
      <section className="auth-box">
        <h2>Recuperar Contraseña</h2>
        <p>Introduce tu correo electrónico registrado y te enviaremos un enlace para restaurar tu acceso.</p>

        <form onSubmit={manejarEnvio}>
          <label>
            Correo Electrónico
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {error && <p className="error-msg">{error}</p>}
          {mensaje && <p className="success-msg" style={{ color: "green" }}>{mensaje}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>
      </section>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { BarraApp, ui, Icono } from "./Stat";
import FormularioPassword from "./FormularioPassword";

// Roles del backend -> etiqueta que se muestra. Lo que no esté aquí (ej. admin) se muestra como estudiante.
const ROLES = {
  student: "estudiante",
  teacher: "profesor",
};

export default function Perfil({ usuario, onActualizarPerfil, onCambiarPassword, onCerrarSesion }) {
  const [editando, setEditando] = useState(false);

  if (!usuario) return null;

  const rol = ROLES[String(usuario.role || "").toLowerCase()] || "estudiante";
  const ini = iniciales(usuario.username || usuario.email);

  return (
    <main className={`${ui.pagina} ${rol === "profesor" ? ui.profesor : ""}`}>
      <BarraApp rol={rol} usuario={usuario}>
        <Link to="/dashboard" className={ui.btnTexto}>
          Mi panel
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-acento text-[.78rem] font-bold text-hoja" aria-hidden="true">{ini}</span>
          <span className="max-sm:hidden">{usuario.username}</span>
        </div>
        <button className={ui.btnGhost} onClick={onCerrarSesion}>
          <Icono nombre="salir" className="size-4" />
          <span className="max-sm:hidden">Cerrar sesión</span>
        </button>
      </BarraApp>

      <div className={ui.contenedor}>
        <header className={`${ui.tarjeta} relative mb-6 flex flex-wrap items-start gap-5.5 overflow-hidden p-7 pt-11.5 *:relative before:absolute before:inset-x-0 before:top-0 before:h-23 before:border-b-[1.5px] before:border-tinta before:bg-acento before:content-[''] max-sm:gap-3.5 max-sm:p-5 max-sm:pt-11`}>
          <div className="grid size-23 shrink-0 place-items-center rounded-full border-[1.5px] border-tinta bg-hoja font-display text-[1.9rem] font-bold text-acento shadow-papel max-sm:size-18 max-sm:text-[1.4rem]" aria-hidden="true">
            {ini}
          </div>
          <div className="min-w-50 flex-1 pt-14 max-sm:basis-full max-sm:pt-0">
            <h1 className={ui.titulo}>{usuario.username}</h1>
            <p className={ui.subtitulo}>{usuario.email}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-acento-suave px-3 py-1 text-[.8rem] font-bold text-acento before:size-1.75 before:rounded-full before:bg-current before:content-['']">{rol === "profesor" ? "Profesor" : "Estudiante"}</span>
          </div>
          <div className={`${ui.acciones} self-end max-sm:self-start`}>
            <button className={ui.btnGhost} onClick={() => setEditando((v) => !v)}>
              {editando ? "Cancelar" : "Editar perfil"}
            </button>
          </div>
        </header>

        {editando && (
          <>
            <FormularioEdicion
              usuario={usuario}
              onGuardar={async (datos) => {
                await onActualizarPerfil?.(datos);
                setEditando(false);
              }}
            />

            <FormularioPassword
              onCambiarPassword={async (datosPassword) => {
                await onCambiarPasswordPath?.(datosPassword);
                setEditando(false);
              }}
            />
          </>
        )}

        <section className={ui.bloque}>
          <h2>Datos de la cuenta</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dato etiqueta="Nombre de usuario" valor={usuario.username} />
            <Dato etiqueta="Correo electrónico" valor={usuario.email} />
            <Dato etiqueta="Tipo de cuenta" valor={rol === "profesor" ? "Profesor" : "Estudiante"} />
            <Dato etiqueta="Miembro desde" valor={formatearFecha(usuario.createdAt)} />
          </dl>
        </section>
      </div>
    </main>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <div>
      <dt className="text-[.86rem] text-tinta-suave">{etiqueta}</dt>
      <dd className="m-0 font-semibold">{valor || "—"}</dd>
    </div>
  );
}

function FormularioEdicion({ usuario, onGuardar }) {
  const [username, setUsername] = useState(usuario.username ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    setGuardando(true);
    setError("");
    try {
      await onGuardar({ username });
    } catch (err) {
      setError(err.message || "No se pudieron guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className={`${ui.bloque} ${ui.form}`}>
      <h2>Editar perfil</h2>
      <label>
        Nombre de usuario
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      {error && <p className={ui.error}>{error}</p>}
      <button className={ui.btn} onClick={guardar} disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </section>
  );
}

const iniciales = (texto = "") =>
  texto
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

const formatearFecha = (f) =>
  f ? new Date(f).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" }) : "";
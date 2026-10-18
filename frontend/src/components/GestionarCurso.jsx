import { useState } from "react";
import PortadaInput from "./PortadaInput";
import CapitulosCurso from "./CapitulosCurso";
import { BarraApp, PortadaCurso, ui } from "./Stat";

/*
  Props:
    curso       -> { title, description, coverImage, status, teacher: { username, email }, createdAt }
                   status: "draft" | "published" (si falta, se trata como borrador)
                   (coverImage es la URL de la portada, puede no existir;
                    teacher puede venir como objeto por el populate, o no venir)
    cargando    -> boolean, mientras llega el curso
    error       -> string. Si hay mensaje, se muestra en lugar del curso (no existe, no es tuyo, etc.)
    onGuardar   -> async ({ title, description, cover }) => void. Debe lanzar un error si falla.
                   cover es un File si eligió una portada nueva, o null si no la cambió.
    onEliminar  -> async () => void. Debe lanzar un error si falla.
    onCambiarEstado -> async ("draft" | "published") => void. Publica el curso o lo vuelve a borrador.
                       Debe lanzar un error si falla.
    capitulos, lecciones, cargandoContenido, errorContenido, onCrearCapitulo, onActualizarCapitulo,
    onEliminarCapitulo, onCrearLeccion, onActualizarLeccion, onEliminarLeccion
                -> se pasan tal cual a <CapitulosCurso>; mira sus props en ese archivo.
    onAgregarQuiz -> () => void. Se ejecuta al pulsar "Agregar quiz final" (por ejemplo, navegar a la pantalla
                     del quiz). Si no se pasa, el botón sale desactivado.
    onVolver    -> () => void. Se ejecuta al pulsar "Volver" (por ejemplo, ir al perfil).
*/
export default function GestionarCurso({
  curso,
  cargando = false,
  error = "",
  onVolver,
  capitulos = [],
  lecciones = [],
  cargandoContenido = false,
  errorContenido = "",
  onGuardar,
  onEliminar,
  quizzes = [],
  onEditarQuiz,
  onCambiarEstado,
  onAgregarQuiz,
  onCrearCapitulo,
  onActualizarCapitulo,
  onEliminarCapitulo,
  onCrearLeccion,
  onActualizarLeccion,
  onEliminarLeccion
}) {
  const [editando, setEditando] = useState(false);

  const volver = (
    <button className={`${ui.link} mb-4`} onClick={onVolver}>
      ← Volver a mi panel
    </button>
  );
  <Marco>
    <button className={ui.btnTexto} onClick={onVolver}>
      ← Mi panel
    </button>
  </Marco>

  if (cargando) {
    return (
      <Marco>
        {volver}
        <div className="py-10 text-center text-tinta-suave">
          <div className={ui.spinner} />
          Cargando curso…
        </div>
      </Marco>
    );
  }

  if (error || !curso) {
    return (
      <Marco>
        {volver}
        <p className={ui.errorCaja}>{error || "No encontramos este curso."}</p>
      </Marco>
    );
  }

  return (
    <Marco>
      {volver}

      <header className="mb-6 flex flex-wrap items-center gap-5">
        {!editando && (
          <div className="w-44 shrink-0 overflow-hidden rounded-[3px] border-[1.5px] border-linea max-sm:w-full">
            <PortadaCurso curso={curso} />
          </div>
        )}
        <div className="min-w-50 flex-1">
          <h1 className={ui.titulo}>{curso.title}</h1>
          <p className={ui.subtitulo}>
            {curso.teacher?.username ? `Profesor: ${curso.teacher.username}` : "Curso"}
            {curso.createdAt && ` · Creado el ${formatearFecha(curso.createdAt)}`}
          </p>
        </div>
        {!editando && (
          <button className={ui.btnGhost} onClick={() => setEditando(true)}>
            Editar curso
          </button>
        )}
      </header>

      <div className="flex flex-col gap-6">
        {editando ? (
          <FormularioCurso
            curso={curso}
            onGuardar={async (datos) => {
              await onGuardar?.(datos);
              setEditando(false);
            }}
            onCancelar={() => setEditando(false)}
          />
        ) : (
          <section className={ui.bloque}>
            <div className={ui.bloqueCabecera}>
              <h2>Descripción</h2>
            </div>
            <p className="m-0 whitespace-pre-line leading-relaxed">{curso.description}</p>
          </section>
        )}

        <Visibilidad estado={curso.status} onCambiar={onCambiarEstado} />

        <CapitulosCurso
          capitulos={capitulos}
          lecciones={lecciones}
          cargando={cargandoContenido}
          error={errorContenido}
          onCrearCapitulo={onCrearCapitulo}
          onActualizarCapitulo={onActualizarCapitulo}
          onEliminarCapitulo={onEliminarCapitulo}
          onCrearLeccion={onCrearLeccion}
          onActualizarLeccion={onActualizarLeccion}
          onEliminarLeccion={onEliminarLeccion}
        />

        <section className={ui.bloque}>
          <div className={ui.bloqueCabecera}>
            <h2>Quizz Final</h2>
            {quizzes.length === 0 &&(
              <button className={ui.btn} onClick={onAgregarQuiz} disabled={!onAgregarQuiz}>
                Agregar quiz
              </button>
            )}
          </div>

          {quizzes.length > 0 ? (
            <ul className="m-0 list-none p-0">
              {quizzes.map((quiz) => (
                <li
                  key={quiz._id}
                  className="flex flex-wrap items-center gap-4 border-t-[1.5px] border-linea py-3 first:border-t-0 first:pt-0"
                >
                  <div className="min-w-40 flex-1">
                    <strong className="block">{quiz.title}</strong>
                    <span className="text-[.88rem] text-tinta-suave">
                      {quiz.questions?.length ?? 0} {(quiz.questions?.length ?? 0) === 1 ? "pregunta" : "preguntas"} ·{" "}
                      {quiz.maxAttempts} {quiz.maxAttempts === 1 ? "intento" : "intentos"}
                    </span>
                  </div>
                  <span className={quiz.published ? ui.pildora : ui.aviso}>
                    {quiz.published ? "Publicado" : "Borrador"}
                  </span>
                  <button className={ui.btnGhost} onClick={() => onEditarQuiz?.(quiz)} disabled={!onEditarQuiz}>
                    Editar / eliminar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${ui.vacio} m-0 text-left`}>
              Evalúa lo aprendido con un quiz al terminar el curso. Todavía no has agregado uno.
            </p>
          )}
        </section>

        <ZonaEliminar titulo={curso.title} onEliminar={onEliminar} />
      </div>
    </Marco>
  );
}

/* ---------- Marco de página (fuera del componente para que no se remonte en cada render) ---------- */
function Marco({ children }) {
  return (
    <div className={`${ui.pagina} ${ui.profesor}`}>
      <BarraApp rol="profesor" />
      <main className={ui.contenedor}>{children}</main>
    </div>
  );
}

/* ---------- Publicar / volver a borrador ---------- */
function Visibilidad({ estado, onCambiar }) {
  const publicado = estado === "published";
  const [cambiando, setCambiando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = async () => {
    setCambiando(true);
    setError("");
    try {
      await onCambiar?.(publicado ? "draft" : "published");
    } catch (err) {
      setError(err.message || "No se pudo cambiar la visibilidad del curso. Inténtalo de nuevo.");
    } finally {
      setCambiando(false);
    }
  };

  return (
    <section className={ui.bloque}>
      <div className={ui.bloqueCabecera}>
        <h2>Visibilidad</h2>
        <span className={publicado ? ui.pildora : ui.aviso}>{publicado ? "Publicado" : "Borrador"}</span>
      </div>

      <p className={`${ui.vacio} mb-3 text-left`}>
        {publicado
          ? "Los estudiantes ven este curso en el catálogo y pueden inscribirse."
          : "Solo tú ves este curso. Publícalo cuando esté listo para recibir estudiantes."}
      </p>

      {error && (
        <p className={`${ui.error} mb-3`} role="alert">
          {error}
        </p>
      )}

      <div className={ui.acciones}>
        <button className={publicado ? ui.btnGhost : ui.btn} onClick={cambiar} disabled={cambiando}>
          {cambiando ? "Guardando…" : publicado ? "Volver a borrador" : "Publicar curso"}
        </button>
      </div>
    </section>
  );
}

/* ---------- Edición ---------- */
function FormularioCurso({ curso, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    title: curso.title ?? "",
    description: curso.description ?? "",
  });
  const [cover, setCover] = useState(null); // null = no cambia la portada actual
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      setError("El título y la descripción no pueden quedar vacíos.");
      return;
    }

    setGuardando(true);
    setError("");
    try {
      await onGuardar({ title, description, image: cover });
    } catch (err) {
      setError(err.message || "No se pudieron guardar los cambios. Inténtalo de nuevo.");
      setGuardando(false);
    }
    // Si sale bien, el padre cierra el formulario y este componente se desmonta
  };

  return (
    <form className={`${ui.bloque} ${ui.form}`} onSubmit={enviar}>
      <div className={ui.bloqueCabecera}>
        <h2>Editar curso</h2>
      </div>

      <label>
        Título
        <input name="title" value={form.title} onChange={cambiar} autoFocus />
      </label>

      <label>
        Descripción
        <textarea name="description" rows={5} value={form.description} onChange={cambiar} />
      </label>

      <PortadaInput archivo={cover} urlActual={curso.image ?? curso.coverImage } onChange={setCover} />

      {error && (
        <p className={ui.error} role="alert">
          {error}
        </p>
      )}

      <div className={ui.acciones}>
        <button type="submit" className={ui.btn} disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        <button type="button" className={ui.btnGhost} onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ---------- Eliminación con confirmación ---------- */
function ZonaEliminar({ titulo, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  const eliminar = async () => {
    setEliminando(true);
    setError("");
    try {
      await onEliminar?.();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el curso. Inténtalo de nuevo.");
      setEliminando(false);
    }
    // Si sale bien, el padre navega a otra pantalla
  };

  return (
    <section className={`${ui.bloque} ${ui.bloquePeligro}`}>
      <div className={ui.bloqueCabecera}>
        <h2>Eliminar curso</h2>
      </div>

      {!confirmando ? (
        <>
          <p className={`${ui.vacio} mb-3 text-left`}>Esta acción borra el curso de forma permanente.</p>
          <button className={ui.btnPeligro} onClick={() => setConfirmando(true)}>
            Eliminar curso
          </button>
        </>
      ) : (
        <div role="alert">
          <p className="mb-3 mt-0">
            ¿Seguro que quieres eliminar <strong>{titulo}</strong>? No se puede deshacer.
          </p>
          {error && <p className={`${ui.error} mb-3`}>{error}</p>}
          <div className={ui.acciones}>
            <button className={ui.btnPeligro} onClick={eliminar} disabled={eliminando}>
              {eliminando ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button
              className={ui.btnGhost}
              onClick={() => {
                setConfirmando(false);
                setError("");
              }}
              disabled={eliminando}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const formatearFecha = (f) =>
  new Date(f).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });

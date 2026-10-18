import { useState } from "react";
import { ui } from "./Stat"; // ajusta la ruta a tu archivo Stat.jsx
import ArchivoInput from "./ArchivoInput";
import { API_URL } from "../services/api";

/*
  Sección "Contenido" de la pantalla de gestión: capítulos y, dentro de cada uno, sus lecciones.

  Props:
    capitulos            -> [{ _id, title, description, order, lessons? }]
    lecciones            -> [{ _id, title, content, videoURL, fileURL, fileName, order, chapter }]
                            Lista plana. Cada lección se asigna a su capítulo por `chapter` (id, o objeto con _id).
                            Si los capítulos ya traen `lessons` dentro, se usan esas y esta prop no hace falta.
    cargando             -> boolean, mientras llega el contenido
    error                -> string. Error al cargar; si tiene valor, se muestra en lugar del contenido
    onCrearCapitulo      -> async ({ title, description }) => void
    onActualizarCapitulo -> async (capituloId, { title, description }) => void
    onEliminarCapitulo   -> async (capituloId) => void
    onCrearLeccion       -> async (capituloId, { title, content, videoURL, file }) => void
    onActualizarLeccion  -> async (leccionId, { title, content, videoURL, file }) => void
    onEliminarLeccion    -> async (leccionId) => void
                            Todas deben lanzar un error si fallan; el mensaje se muestra en pantalla.

  `file` es un File si el usuario eligió un archivo nuevo, o null si no (al editar, null = no cambia el actual).
  Como hay archivo, en el service envía los datos con FormData en vez de JSON.
  "order" no se envía desde aquí: lo calcula el backend. El número que se ve es la posición en la lista.
*/
export default function CapitulosCurso({
  capitulos = [],
  lecciones = [],
  cargando = false,
  error = "",
  onCrearCapitulo,
  onActualizarCapitulo,
  onEliminarCapitulo,
  onCrearLeccion,
  onActualizarLeccion,
  onEliminarLeccion,
}) {
  const [creando, setCreando] = useState(false);

  const ordenados = [...capitulos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const leccionesDe = (cap) => {
    const lista = Array.isArray(cap.lessons) && typeof cap.lessons[0] === "object"
      ? cap.lessons
      : lecciones.filter((l) => String(l.chapter?._id ?? l.chapter) === String(cap._id));
    return [...lista].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  return (
    <section className={ui.bloque}>
      <div className={ui.bloqueCabecera}>
        <h2>Contenido del curso</h2>
        {!creando && (
          <button className={ui.btn} onClick={() => setCreando(true)}>
            Agregar capítulo
          </button>
        )}
      </div>

      {creando && (
        <div className="mb-4 rounded-[3px] border-[1.5px] border-linea bg-hoja-2 p-4">
          <FormularioCapitulo
            textoBoton="Crear capítulo"
            onGuardar={async (datos) => {
              await onCrearCapitulo?.(datos);
              setCreando(false);
            }}
            onCancelar={() => setCreando(false)}
          />
        </div>
      )}

      {cargando ? (
        <p className={ui.vacio}>Cargando contenido…</p>
      ) : error ? (
        <p className={ui.errorCaja}>{error}</p>
      ) : ordenados.length === 0 ? (
        !creando && (
          <div className={ui.vacioCaja}>
            <span className={ui.vacioIcono} aria-hidden="true">
              📖
            </span>
            <p className={ui.vacio}>
              Este curso aún no tiene capítulos. Crea el primero y luego agrega lecciones dentro de él.
            </p>
          </div>
        )
      ) : (
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {ordenados.map((cap, i) => (
            <Capitulo
              key={cap._id}
              numero={i + 1}
              capitulo={cap}
              lecciones={leccionesDe(cap)}
              onActualizarCapitulo={onActualizarCapitulo}
              onEliminarCapitulo={onEliminarCapitulo}
              onCrearLeccion={onCrearLeccion}
              onActualizarLeccion={onActualizarLeccion}
              onEliminarLeccion={onEliminarLeccion}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

/* ---------- Un capítulo con sus lecciones ---------- */
function Capitulo({
  numero,
  capitulo,
  lecciones,
  onActualizarCapitulo,
  onEliminarCapitulo,
  onCrearLeccion,
  onActualizarLeccion,
  onEliminarLeccion,
}) {
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [creandoLeccion, setCreandoLeccion] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [abiertaId, setAbiertaId] = useState(null);
  // { tipo: "capitulo" | "leccion", id } mientras se pide confirmación para borrar
  const [confirmando, setConfirmando] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  const pedirConfirmacion = (tipo, id) => {
    setConfirmando({ tipo, id });
    setErrorEliminar("");
  };

  const eliminar = async () => {
    setEliminando(true);
    setErrorEliminar("");
    try {
      if (confirmando.tipo === "capitulo") await onEliminarCapitulo?.(confirmando.id);
      else await onEliminarLeccion?.(confirmando.id);
      setConfirmando(null);
    } catch (err) {
      setErrorEliminar(err.message || "No se pudo eliminar. Inténtalo de nuevo.");
    } finally {
      setEliminando(false);
    }
  };

  const cajaConfirmar = (texto) => (
    <div className="mt-3 rounded-[3px] border-[1.5px] border-linea bg-hoja-2 p-3" role="alert">
      <p className="mb-3 mt-0">{texto}</p>
      {errorEliminar && <p className={`${ui.error} mb-3`}>{errorEliminar}</p>}
      <div className={ui.acciones}>
        <button className={ui.btnPeligro} onClick={eliminar} disabled={eliminando}>
          {eliminando ? "Eliminando…" : "Sí, eliminar"}
        </button>
        <button className={ui.btnGhost} onClick={() => setConfirmando(null)} disabled={eliminando}>
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <li className="rounded-[3px] border-[1.5px] border-linea">
      {/* Cabecera del capítulo */}
      <div className="p-4">
        {editandoTitulo ? (
          <FormularioCapitulo
            inicial={capitulo}
            textoBoton="Guardar"
            onGuardar={async (datos) => {
              await onActualizarCapitulo?.(capitulo._id, datos);
              setEditandoTitulo(false);
            }}
            onCancelar={() => setEditandoTitulo(false)}
          />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[.82rem] font-semibold uppercase tracking-wide text-acento">
              Capítulo {numero}
            </span>
            <h3 className="m-0 min-w-[140px] flex-1 font-display text-[1.1rem] font-semibold tracking-tight">
              {capitulo.title}
            </h3>
            <span className="text-[.85rem] text-tinta-suave">
              {lecciones.length} {lecciones.length === 1 ? "lección" : "lecciones"}
            </span>
            <div className="flex gap-3">
              <button className={ui.link} onClick={() => setEditandoTitulo(true)}>
                Editar
              </button>
              <button className={ui.linkPeligro} onClick={() => pedirConfirmacion("capitulo", capitulo._id)}>
                Eliminar
              </button>
            </div>
          </div>
        )}

        {!editandoTitulo && capitulo.description && (
          <p className="mb-0 mt-2 whitespace-pre-line text-[.93rem] leading-relaxed text-tinta-suave">
            {capitulo.description}
          </p>
        )}

        {confirmando?.tipo === "capitulo" &&
          cajaConfirmar(
            <>
              ¿Eliminar el capítulo <strong>{capitulo.title}</strong>? Solo se puede eliminar si no tiene lecciones.
              No se puede deshacer.
            </>
          )}
      </div>

      {/* Lecciones del capítulo */}
      <div className="border-t-[1.5px] border-linea p-4">
        {lecciones.length === 0 && !creandoLeccion && (
          <p className={`${ui.vacio} mb-3 text-left`}>Este capítulo todavía no tiene lecciones.</p>
        )}

        {lecciones.length > 0 && (
          <ol className="m-0 mb-3 list-none p-0">
            {lecciones.map((l, i) => {
              const abierta = abiertaId === l._id;
              return (
                <li key={l._id} className="border-t-[1.5px] border-linea py-3 first:border-t-0 first:pt-0">
                  {editandoId === l._id ? (
                    <FormularioLeccion
                      inicial={l}
                      textoBoton="Guardar cambios"
                      onGuardar={async (datos) => {
                        await onActualizarLeccion?.(l._id, datos);
                        setEditandoId(null);
                      }}
                      onCancelar={() => setEditandoId(null)}
                    />
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="grid h-7 min-w-7 shrink-0 place-items-center rounded-full bg-acento-suave px-1.5 text-[.78rem] font-bold text-acento"
                          aria-hidden="true"
                        >
                          {numero}.{i + 1}
                        </span>
                        <button
                          className="min-w-[140px] flex-1 cursor-pointer border-0 bg-transparent p-0 text-left text-[1rem] font-semibold text-tinta hover:text-acento"
                          aria-expanded={abierta}
                          onClick={() => setAbiertaId(abierta ? null : l._id)}
                        >
                          {l.title}
                          {l.videoURL && <span className="ml-2 text-[.8rem] text-tinta-suave">▶ video</span>}
                          {l.resources?.length > 0 && (
                            <span className="ml-2 text-[.8rem] text-tinta-suave">
                              📎 {l.resources.length} archivo(s)
                            </span>
                          )}
                        </button>
                        <div className="flex gap-3">
                          <button
                            className={ui.link}
                            onClick={() => {
                              setEditandoId(l._id);
                              setCreandoLeccion(false);
                              setConfirmando(null);
                            }}
                          >
                            Editar
                          </button>
                          <button className={ui.linkPeligro} onClick={() => pedirConfirmacion("leccion", l._id)}>
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {abierta && <ContenidoLeccion leccion={l} />}

                      {confirmando?.tipo === "leccion" &&
                        confirmando.id === l._id &&
                        cajaConfirmar(
                          <>
                            ¿Eliminar <strong>{l.title}</strong>? No se puede deshacer.
                          </>
                        )}
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {creandoLeccion ? (
          <div className="rounded-[3px] border-[1.5px] border-linea bg-hoja-2 p-4">
            <FormularioLeccion
              textoBoton="Crear lección"
              onGuardar={async (datos) => {
                await onCrearLeccion?.(capitulo._id, datos);
                setCreandoLeccion(false);
              }}
              onCancelar={() => setCreandoLeccion(false)}
            />
          </div>
        ) : (
          <button
            className={ui.btnGhost}
            onClick={() => {
              setCreandoLeccion(true);
              setEditandoId(null);
            }}
          >
            + Agregar lección
          </button>
        )}
      </div>
    </li>
  );
}

/* ---------- Contenido desplegado de una lección ---------- */
function ContenidoLeccion({ leccion }) {
  const embed = urlDeEmbed(leccion.videoURL);
  const esEnlaceValido = /^https?:\/\//i.test(leccion.videoURL || "");

  return (
    <div className="mt-3 border-l-[3px] border-acento-suave pl-4">
      <p className="m-0 mb-3 whitespace-pre-line leading-relaxed">{leccion.content}</p>

      {embed ? (
        <div className="mb-3 aspect-video w-full max-w-[560px] overflow-hidden rounded-[3px] border-[1.5px] border-linea bg-tinta">
          <iframe
            src={embed}
            title={`Video de la lección ${leccion.title}`}
            className="size-full"
            loading="lazy"
            allow="accelerometer; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        esEnlaceValido && (
          <p className="mb-3 mt-0">
            <a className={ui.link} href={leccion.videoURL} target="_blank" rel="noopener noreferrer">
              Ver video
            </a>
          </p>
        )
      )}

      {leccion.resources?.length > 0 && (
        <div className="mb-3">
          <h4 className="mb-2 font-semibold">Material de apoyo</h4>

          <ul className="space-y-2">
            {leccion.resources.map((archivo, index) => (
              <li key={archivo.publicId || index}>
                <a
                  href={`${API_URL}/api/lessons/${leccion._id}/resources/${index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📎 {archivo.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Formulario de capítulo (crear y renombrar) ---------- */
function FormularioCapitulo({ inicial, textoBoton, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    title: inicial?.title ?? "",
    description: inicial?.description ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    const limpio = form.title.trim();
    if (!limpio) {
      setError("El capítulo necesita un título.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await onGuardar({ title: limpio, description: form.description.trim() });
    } catch (err) {
      setError(err.message || "No se pudo guardar el capítulo. Inténtalo de nuevo.");
      setGuardando(false);
    }
    // Si sale bien, el padre cierra el formulario y este componente se desmonta
  };

  return (
    <form className={ui.form} onSubmit={enviar}>
      <label>
        Título del capítulo
        <input
          name="title"
          value={form.title}
          onChange={cambiar}
          placeholder="Ej. Unidad 1: Fundamentos"
          autoFocus
        />
      </label>

      <label>
        Descripción (opcional)
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={cambiar}
          placeholder="¿Qué se verá en este capítulo?"
        />
      </label>

      {error && (
        <p className={ui.error} role="alert">
          {error}
        </p>
      )}

      <div className={ui.acciones}>
        <button type="submit" className={ui.btn} disabled={guardando}>
          {guardando ? "Guardando…" : textoBoton}
        </button>
        <button type="button" className={ui.btnGhost} onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ---------- Formulario de lección (crear y editar) ---------- */
function FormularioLeccion({ inicial, textoBoton, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    title: inicial?.title ?? "",
    content: inicial?.content ?? "",
    videoURL: inicial?.videoURL ?? "",
  });
  const [file, setFile] = useState(null); // null = no se sube / no cambia el archivo actual
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();
    const videoURL = form.videoURL.trim();

    if (!title || !content) {
      setError("El título y el contenido son obligatorios.");
      return;
    }
    if (videoURL && !/^https?:\/\/\S+$/i.test(videoURL)) {
      setError("El enlace del video debe empezar por http:// o https://");
      return;
    }

    setGuardando(true);
    setError("");
    try {
      await onGuardar({ title, content, videoURL, file });
    } catch (err) {
      setError(err.message || "No se pudo guardar la lección. Inténtalo de nuevo.");
      setGuardando(false);
    }
    // Si sale bien, el padre cierra el formulario y este componente se desmonta
  };

  return (
    <form className={ui.form} onSubmit={enviar}>
      <label>
        Título
        <input
          name="title"
          value={form.title}
          onChange={cambiar}
          placeholder="Ej. Introducción a las fracciones"
          autoFocus
        />
      </label>

      <label>
        Contenido
        <textarea
          name="content"
          rows={6}
          value={form.content}
          onChange={cambiar}
          placeholder="Explica la lección con tus palabras."
        />
      </label>

      <label>
        Enlace del video (opcional)
        <input
          name="videoURL"
          value={form.videoURL}
          onChange={cambiar}
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </label>

      <ArchivoInput
        archivo={file}
        nombreActual={inicial?.resources?.[0]?.name}
        urlActual={inicial?.resources?.[0]?.url}
        onChange={setFile}
      />

      {error && (
        <p className={ui.error} role="alert">
          {error}
        </p>
      )}

      <div className={ui.acciones}>
        <button type="submit" className={ui.btn} disabled={guardando}>
          {guardando ? "Guardando…" : textoBoton}
        </button>
        <button type="button" className={ui.btnGhost} onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/*
  Convierte un enlace normal de YouTube en uno que se pueda incrustar.
  Los enlaces youtube.com/watch?v=... y youtu.be/... no se pueden poner en un <iframe>:
  hay que usar youtube.com/embed/ID. Si no es de YouTube devuelve null (se muestra como enlace).
*/
function urlDeEmbed(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id = null;

    if (host === "youtu.be") {
      id = u.pathname.slice(1);
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
    }

    return id && /^[\w-]+$/.test(id) ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}
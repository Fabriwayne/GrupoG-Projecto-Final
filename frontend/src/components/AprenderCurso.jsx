import { useEffect, useMemo, useState } from "react";
import { ui, BarraApp, PortadaCurso } from "./Stat";
import { API_URL } from "../services/api";

/*
  Pantalla para estudiar un curso: portada, índice por capítulos y visor de la lección elegida.
  No llama a la API: todo entra por props.

  Props:
    curso                 -> { _id, title, description, coverImage, teacher: { username } }
    capitulos             -> [{ _id, title, description, order, lessons? }]. Se ordenan por `order` aquí.
    lecciones             -> [{ _id, title, content, videoURL, fileURL, fileName, order, chapter }]
                             Lista plana; cada lección se asigna a su capítulo por `chapter` (id u objeto con _id).
                             Si los capítulos ya traen `lessons` dentro, se usan esas y esta prop no hace falta.
                             Las lecciones sin capítulo conocido se muestran al final en "Otras lecciones".
    cargando              -> boolean
    error                 -> string. Si tiene valor, se muestra en lugar del curso
    onVolver              -> () => void. "← Volver a mis cursos"
    --- Opcionales (para cuando implementes progreso por lección) ---
    leccionesCompletadas  -> array de ids de lecciones completadas
    onCompletarLeccion    -> async (leccion) => void. Si no se pasa, el botón "Marcar como completada" no aparece.
*/
export default function AprenderCurso({
  curso,
  capitulos = [],
  lecciones = [],
  quizzes = [],
  cargando = false,
  error = "",
  onVolver,
  onAbrirQuiz,
  leccionesCompletadas = [],
  onCompletarLeccion,
}) {
  const [indice, setIndice] = useState(0);
  const [marcando, setMarcando] = useState(false);
  const [fallo, setFallo] = useState("");

  // Secciones { id, titulo, items: [{ leccion, indice, etiqueta }] } y lista plana en el orden de estudio
  const { secciones, plana } = useMemo(() => {
    const porOrden = (a, b) => (a.order ?? 0) - (b.order ?? 0);
    const idDe = (v) => String(v?._id ?? v);
    const conocidos = new Set(capitulos.map((c) => String(c._id)));


    const grupos = [...capitulos].sort(porOrden).map((cap) => {
      const propias =
        Array.isArray(cap.lessons) && typeof cap.lessons[0] === "object"
          ? cap.lessons
          : lecciones.filter((l) => idDe(l.chapter) === String(cap._id));
      return { id: cap._id, titulo: cap.title, descripcion: cap.description, lista: [...propias].sort(porOrden) };
    });

    const sueltas = lecciones.filter((l) => !l.chapter || !conocidos.has(idDe(l.chapter)));
    if (sueltas.length) grupos.push({ id: "sueltas", titulo: "Otras lecciones", lista: [...sueltas].sort(porOrden) });

    const plana = [];
    let n = 0;
    const secciones = grupos
      .filter((g) => g.lista.length > 0) // un capítulo vacío no se muestra al estudiante
      .map((g, gi) => ({
        id: g.id,
        titulo: g.titulo,
        descripcion: g.descripcion,
        items: g.lista.map((leccion, li) => {
          const item = { leccion, indice: n++, etiqueta: `${gi + 1}.${li + 1}` };
          plana.push(item);
          return item;
        }),
      }));
    return { secciones, plana };
  }, [capitulos, lecciones]);

  const completadas = useMemo(() => new Set(leccionesCompletadas.map(String)), [leccionesCompletadas]);

  // Si la lista cambia y el índice queda fuera de rango, vuelve a la primera
  useEffect(() => {
    if (indice >= plana.length) setIndice(0);
  }, [plana.length, indice]);

  const actual = plana[indice];
  const leccion = actual?.leccion;
  const embed = leccion ? urlDeEmbed(leccion.videoURL) : "";
  const hechas = plana.filter((p) => completadas.has(String(p.leccion._id))).length;
  const porcentaje = plana.length ? Math.round((hechas / plana.length) * 100) : 0;
  const seccionActual = secciones.find((s) => s.items.some((it) => it.indice === indice));
  const tituloCapitulo = seccionActual?.titulo;

  const irA = (i) => {
    setIndice(i);
    setFallo("");
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  };

  const completar = async () => {
    setMarcando(true);
    setFallo("");
    try {
      await onCompletarLeccion?.(leccion);
    } catch (err) {
      setFallo(err.message || "No se pudo marcar la lección. Inténtalo de nuevo.");
    } finally {
      setMarcando(false);
    }
  };

  return (
    <div className={ui.pagina}>
      <BarraApp />

      <main className={ui.contenedor}>
        <button className={`${ui.link} mb-4`} onClick={onVolver}>
          ← Volver a mis cursos
        </button>

        {cargando ? (
          <div className="py-10 text-center text-tinta-suave">
            <div className={ui.spinner} />
            Cargando curso…
          </div>
        ) : error ? (
          <p className={ui.errorCaja}>{error}</p>
        ) : !curso ? (
          <div className={ui.vacioCaja}>
            <p className={ui.vacio}>No encontramos este curso.</p>
          </div>
        ) : (
          <>
            {/* Cabecera del curso */}
            <header className={`${ui.bloque} mb-6 flex flex-wrap items-center gap-5`}>
              <div className="w-40 shrink-0 overflow-hidden rounded-[3px] border-[1.5px] border-linea max-sm:w-full">
                <PortadaCurso curso={curso} />
              </div>
              <div className="min-w-50 flex-1">
                <h1 className={ui.titulo}>{curso.title}</h1>
                {curso.teacher?.username && (
                  <p className="m-0 mb-2 text-[.9rem] text-tinta-suave">Profesor: {curso.teacher.username}</p>
                )}
                <p className="m-0 text-[.95rem] leading-relaxed">{curso.description}</p>

                {plana.length > 0 && onCompletarLeccion && (
                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className="h-2 w-48 overflow-hidden rounded-full bg-acento-suave"
                      title={`${porcentaje}% completado`}
                    >
                      <div className="h-full rounded-full bg-acento" style={{ width: `${porcentaje}%` }} />
                    </div>
                    <span className="text-[.9rem] tabular-nums text-tinta-suave">
                      {hechas}/{plana.length} lecciones
                    </span>
                  </div>
                )}
              </div>
            </header>

            {plana.length === 0 ? (
              <div className={ui.vacioCaja}>
                <span className={ui.vacioIcono} aria-hidden="true">
                  🛠️
                </span>
                <p className={ui.vacio}>El profesor todavía no ha publicado lecciones en este curso.</p>
              </div>
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* Visor de la lección */}
                <article className={ui.bloque} aria-live="polite">
                  <p className="m-0 mb-1 text-[.82rem] font-semibold uppercase tracking-wide text-acento">
                    {tituloCapitulo} · Lección {actual.etiqueta}
                  </p>
                  {seccionActual?.descripcion && (
                    <p className="m-0 mb-3 text-[.88rem] text-tinta-suave">{seccionActual.descripcion}</p>
                  )}
                  <h2 className="m-0 mb-4 font-display text-[1.5rem] font-semibold leading-snug tracking-tight">
                    {leccion.title}
                  </h2>

                  {embed ? (
                    <div className="mb-4 aspect-video w-full overflow-hidden rounded-[3px] border-[1.5px] border-linea bg-tinta">
                      <iframe
                        key={leccion._id}
                        src={embed}
                        title={`Video: ${leccion.title}`}
                        className="size-full"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    </div>
                  ) : esHttp(leccion.videoURL) ? (
                    <p className="mb-4">
                      <a href={leccion.videoURL} target="_blank" rel="noopener noreferrer" className={ui.link}>
                        Ver video en una pestaña nueva ↗
                      </a>
                    </p>
                  ) : null}

                  {leccion.content ? (
                    <div className="whitespace-pre-line text-[1rem] leading-relaxed">{leccion.content}</div>
                  ) : (
                    !embed && <p className={ui.vacio}>Esta lección no tiene contenido todavía.</p>
                  )}

                  {leccion.resources?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold">
                        Material de apoyo
                      </h4>

                      <ul className="mt-2 space-y-2">
                        {leccion.resources.map((archivo, index) => (
                          <li
                            key={archivo.publicId || index}
                            className="flex items-center justify-between gap-3 rounded border p-3"
                          >
                            <span className="min-w-0 truncate">
                              📎 {archivo.name}
                            </span>

                            <a
                              href={`${API_URL}/api/lessons/${leccion._id}/resources/${index}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={ui.link}
                            >
                              📎 {archivo.name}

                              Ver / descargar
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fallo && (
                    <p className={`${ui.error} mt-4`} role="alert">
                      {fallo}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-2 border-t-[1.5px] border-linea pt-4">
                    <button className={ui.btnGhost} onClick={() => irA(indice - 1)} disabled={indice === 0}>
                      ← Anterior
                    </button>
                    <button
                      className={ui.btnGhost}
                      onClick={() => irA(indice + 1)}
                      disabled={indice === plana.length - 1}
                    >
                      Siguiente →
                    </button>

                    {onCompletarLeccion &&
                      (completadas.has(String(leccion._id)) ? (
                        <span className={`${ui.pildora} ml-auto`}>✓ Completada</span>
                      ) : (
                        <button className={`${ui.btn} ml-auto`} onClick={completar} disabled={marcando}>
                          {marcando ? "Guardando…" : "Marcar como completada"}
                        </button>
                      ))}
                  </div>
                </article>

                {/* Índice por capítulos */}
                <aside className={`${ui.bloque} lg:sticky lg:top-4`}>
                  <div className={ui.bloqueCabecera}>
                    <h2>Contenido</h2>
                    <span className="text-[.85rem] text-tinta-suave">{plana.length} lecciones</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {secciones.map((s, si) => (
                      <section key={s.id}>
                        <h3 className="m-0 mb-1.5 text-[.8rem] font-bold uppercase tracking-wide text-tinta-suave">
                          Capítulo {si + 1} · {s.titulo}
                        </h3>
                        {s.descripcion && (
                          <p className="m-0 mb-1.5 text-[.82rem] leading-snug text-tinta-suave">{s.descripcion}</p>
                        )}
                        <ol className="m-0 flex list-none flex-col gap-1 p-0">
                          {s.items.map((it) => {
                            const activa = it.indice === indice;
                            const hecha = completadas.has(String(it.leccion._id));
                            return (
                              <li key={it.leccion._id}>
                                <button
                                  type="button"
                                  onClick={() => irA(it.indice)}
                                  aria-current={activa ? "true" : undefined}
                                  className={`flex w-full items-center gap-3 rounded-[3px] border-[1.5px] px-3 py-2.5 text-left transition-colors ${activa
                                    ? "border-acento bg-acento-suave font-semibold"
                                    : "border-transparent hover:bg-acento-suave"
                                    }`}
                                >
                                  <span
                                    className={`grid h-6 min-w-6 shrink-0 place-items-center rounded-full px-1 text-[.72rem] font-bold ${hecha ? "bg-acento text-hoja" : "border-[1.5px] border-linea text-tinta-suave"
                                      }`}
                                    aria-hidden="true"
                                  >
                                    {hecha ? "✓" : it.etiqueta}
                                  </span>
                                  <span className="min-w-0 flex-1 text-[.93rem] leading-snug">
                                    {it.leccion.title}
                                  </span>
                                  {it.leccion.videoURL && (
                                    <span className="text-[.8rem] text-tinta-suave" title="Incluye video">
                                      ▶
                                    </span>
                                  )}
                                  {it.leccion.fileURL && (
                                    <span className="text-[.8rem] text-tinta-suave" title="Incluye archivo">
                                      📎
                                    </span>
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ol>
                      </section>
                    ))}
                  </div>
                </aside>
              </div>
            )}
            {quizzes.length > 0 && (
              <section className={`${ui.bloque} mt-6`}>
                <div className={ui.bloqueCabecera}>
                  <h2>Evaluaciones</h2>
                </div>
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
                          hasta {quiz.maxAttempts} {quiz.maxAttempts === 1 ? "intento" : "intentos"}
                        </span>
                      </div>
                      <button className={ui.btn} onClick={() => onAbrirQuiz?.(quiz)} disabled={!onAbrirQuiz}>
                        Tomar quiz
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main >
    </div >
  );
}

const esHttp = (url) => /^https?:\/\//i.test(url || "");

// Convierte enlaces de YouTube (watch, youtu.be, shorts, embed) a la URL de embed. Si no es YouTube, "".
function urlDeEmbed(url) {
  if (!esHttp(url)) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
      else if (/^\/(shorts|embed)\//.test(u.pathname)) id = u.pathname.split("/")[2] || "";
    }
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube.com/embed/${id}` : "";
  } catch {
    return "";
  }
}

import { useMemo, useState } from "react";
import { ui, BarraApp, PortadaCurso } from "./Stat"; // ajusta la ruta a tu archivo Stat.jsx

/*
  Catálogo de cursos publicados, para el estudiante. No llama a la API: todo entra por props.

  Props:
    cursos         -> [{ _id, title, description, coverImage, teacher: { username } }]
                      Solo cursos publicados (eso lo decide el backend, no este componente).
    inscritosIds   -> array de ids de los cursos en los que el estudiante ya está inscrito
    cargando       -> boolean
    error          -> string. Si tiene valor, se muestra en lugar del catálogo
    onInscribirse  -> async (curso) => void. Debe lanzar un error si falla; el mensaje se muestra
                      en la tarjeta de ese curso. Al terminar bien, el padre debe añadir el id a `inscritosIds`.
    onAbrirCurso   -> (curso) => void. Para cursos ya inscritos ("Ir al curso"). Opcional.
    onVolver       -> () => void. "← Volver al perfil"
*/
export default function CatalogoCursos({
  cursos = [],
  inscritosIds = [],
  cargando = false,
  error = "",
  onInscribirse,
  onAbrirCurso,
  onVolver,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [inscribiendoId, setInscribiendoId] = useState(null);
  const [fallo, setFallo] = useState({ id: null, mensaje: "" });

  const inscritos = useMemo(() => new Set(inscritosIds.map(String)), [inscritosIds]);

  const texto = busqueda.trim().toLowerCase();
  const visibles = cursos.filter(
    (c) =>
      !texto ||
      [c.title, c.description, c.teacher?.username].some((v) => v?.toLowerCase().includes(texto))
  );

  const inscribirse = async (curso) => {
    setInscribiendoId(curso._id);
    setFallo({ id: null, mensaje: "" });
    try {
      await onInscribirse?.(curso);
    } catch (err) {
      setFallo({
        id: curso._id,
        mensaje: err.message || "No pudimos completar la inscripción. Inténtalo de nuevo.",
      });
    } finally {
      setInscribiendoId(null);
    }
  };

  return (
    <div className={ui.pagina}>
      <BarraApp />

      <main className={ui.contenedor}>
        <button className={`${ui.link} mb-4`} onClick={onVolver}>
          ← Volver al perfil
        </button>

        <header className="mb-6">
          <h1 className={ui.titulo}>Catálogo de cursos</h1>
          <p className={ui.subtitulo}>Elige un curso para inscribirte y empezar a estudiar.</p>
        </header>

        <label className={`${ui.campo} mb-6 max-w-[420px]`}>
          <span>Buscar curso</span>
          <input
            type="search"
            className={ui.input}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Por título, descripción o profesor"
          />
        </label>

        {cargando ? (
          <div className="py-10 text-center text-tinta-suave">
            <div className={ui.spinner} />
            Cargando cursos…
          </div>
        ) : error ? (
          <p className={ui.errorCaja}>{error}</p>
        ) : cursos.length === 0 ? (
          <div className={ui.vacioCaja}>
            <span className={ui.vacioIcono} aria-hidden="true">
              📚
            </span>
            <p className={ui.vacio}>Todavía no hay cursos publicados. Vuelve pronto.</p>
          </div>
        ) : visibles.length === 0 ? (
          <div className={ui.vacioCaja}>
            <p className={ui.vacio}>Ningún curso coincide con tu búsqueda.</p>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[18px] p-0">
            {visibles.map((c) => {
              const inscrito = inscritos.has(String(c._id));
              const inscribiendo = inscribiendoId === c._id;

              return (
                <li key={c._id} className={`${ui.panel} flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg`}>
                  <PortadaCurso curso={c} />

                  <div className="flex flex-1 flex-col gap-2 p-[18px]">
                    <h2 className="m-0 font-display text-[1.1rem] font-semibold leading-snug tracking-tight">
                      {c.title}
                    </h2>
                    {c.teacher?.username && (
                      <p className="m-0 text-[.88rem] text-tinta-suave">Profesor: {c.teacher.username}</p>
                    )}
                    <p className="m-0 line-clamp-3 text-[.92rem] leading-relaxed">{c.description}</p>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                      {inscrito ? (
                        <>
                          <span className={ui.pildora}>Inscrito</span>
                          {onAbrirCurso && (
                            <button className={ui.btnGhost} onClick={() => onAbrirCurso(c)}>
                              Ir al curso
                            </button>
                          )}
                        </>
                      ) : (
                        <button className={ui.btn} onClick={() => inscribirse(c)} disabled={inscribiendo}>
                          {inscribiendo ? "Inscribiendo…" : "Inscribirme"}
                        </button>
                      )}
                    </div>

                    {fallo.id === c._id && (
                      <p className={ui.error} role="alert">
                        {fallo.mensaje}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

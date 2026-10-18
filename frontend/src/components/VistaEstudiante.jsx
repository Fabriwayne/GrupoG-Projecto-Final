import Stat, { PortadaCurso, ui } from "./Stat";

/*
  Props:
    -> inscripciones -> [{
      _id,
      progress,
      course: {
        _id,
        title,
        description,
        image,
        teacher: { username }
      }
    }]
    tareas   -> [{ id, titulo, curso, fechaEntrega, estado }]   (se muestran las de estado "pendiente")
    cargando -> boolean
    onExplorar    -> () => void
    onAbrirCurso  -> (curso) => void
*/
export default function VistaEstudiante({
  inscripciones = [],
  tareas = [],
  cargando = false,
  onExplorar,
  onAbrirCurso
}) {
  // Convertimos las inscripciones al formato que necesita la interfaz.
  const cursos = inscripciones
    .filter((inscripcion) => inscripcion.course)
    .map((inscripcion) => ({
      ...inscripcion.course,
      progreso: inscripcion.progress ?? 0,
      inscripcionId: inscripcion._id
    }));

  const promedio = promedioDe(
    cursos.map((c) => c.calificacion)
  );

  const progresoGeneral = promedioDe(
    cursos.map((c) => c.progreso)
  );

  const pendientes = tareas.filter(
    (t) => t.estado === "pendiente"
  );

  return (
    <>
      {/* Estadísticas del estudiante */}

      <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className={`${ui.panel} p-5`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">Resumen</h2>
            <button className={ui.btn} onClick={onExplorar}>
              Explorar cursos
            </button>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Stat
              icono="📚"
              tono="acento"
              valor={cursos.length}
              etiqueta="Cursos inscritos"
            />

            <Stat
              icono="↗"
              tono="bosque"
              valor={`${Math.round(progresoGeneral)}%`}
              etiqueta="Progreso general"
              progreso={progresoGeneral}
            />

            <Stat
              icono="★"
              tono="aviso"
              valor={promedio ? promedio.toFixed(1) : "—"}
              etiqueta="Promedio"
            />

            <Stat
              icono="⏰"
              tono="terracota"
              valor={pendientes.length}
              etiqueta="Tareas pendientes"
            />
          </div>
        </section>
      </div>

      {/* Cursos inscritos */}
      <section className={ui.bloque}>
        <div className={ui.bloqueCabecera}>
          <div>
            <h2>Mis cursos</h2>
            <p>Continúa aprendiendo desde donde lo dejaste.</p>
          </div>
        </div>

        {cargando ? (
          <p className={ui.vacio}>
            Cargando cursos…
          </p>
        ) : cursos.length === 0 ? (
          <div className={ui.vacioCaja}>
            <span
              className={ui.vacioIcono}
              aria-hidden="true"
            >
              🎓
            </span>

            <p className={ui.vacio}>
              Aún no estás inscrito en ningún curso.
              Explora el catálogo para empezar.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {cursos.map((c) => (
              <li
                key={c._id}
                className="flex flex-col overflow-hidden rounded-2xl border border-linea/70 bg-hoja transition hover:-translate-y-1 hover:shadow-lg"
              >
                <PortadaCurso curso={c} />
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <strong className="text-[1.02rem] leading-snug">{c.title}</strong>

                  <div className="flex flex-wrap items-center gap-2.5 text-[.86rem] text-tinta-suave">
                    <span>{c.teacher?.username || "Profesor"}</span>

                    {typeof c.calificacion === "number" && (
                      <span className="rounded-full bg-hoja-2 px-2.5 py-0.5 text-[.8rem] font-bold text-tinta">
                        ★ {c.calificacion}
                      </span>
                    )}
                  </div>

                  {c.description && (
                    <p className="line-clamp-2 text-[.9rem] text-tinta-suave">
                      {c.description}
                    </p>
                  )}

                  {/* ... El resto de la barra de progreso y el botón se quedan exactamente IGUAL */}


                  {/* Barra de progreso */}
                  <div className="mt-auto pt-3">
                    <div className="mb-1.5 flex items-center justify-between text-[.82rem]">
                      <span className="font-semibold text-tinta-suave">Progreso</span>
                      <span className="font-bold text-acento">{c.progreso}%</span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-acento-suave"
                      title={`${c.progreso}% completado`}
                    >
                      <div
                        className="h-full rounded-full bg-acento transition-[width] duration-500"
                        style={{
                          width: `${c.progreso}%`
                        }}
                      />
                    </div>

                    <span className="whitespace-nowrap text-[.9rem] text-tinta-suave">
                      {c.progreso}%
                    </span>
                  </div>

                  {/* Acceso al curso */}
                  <button
                    className={`${ui.btn} mt-2 w-full`}
                    onClick={() => onAbrirCurso?.(c)}
                    disabled={!onAbrirCurso}
                  >
                    Continuar aprendiendo
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Tareas pendientes */}
      <section className={ui.bloque}>
        <h2>Próximas entregas</h2>
        {cargando ? (
          <p className={ui.vacio}>Cargando tareas…</p>
        ) : pendientes.length === 0 ? (
          <div className={ui.vacioCaja}>
            <span className={ui.vacioIcono} aria-hidden="true">🎉</span>
            <p className={ui.vacio}>No tienes tareas pendientes. ¡Estás al día!</p>
          </div>
        ) : (
          <ul className="grid gap-2.5">
            {pendientes.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3.5 rounded-xl border border-linea/70 bg-papel/40 px-4 py-3 max-sm:flex-wrap"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <strong>{t.titulo}</strong>
                  <span className="text-[.88rem] text-tinta-suave">{t.curso}</span>
                </div>
                <span className="whitespace-nowrap rounded-full bg-acento-suave px-3 py-1 text-[.82rem] font-semibold text-acento">{formatearFecha(t.fechaEntrega)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

const promedioDe = (nums) => {
  const v = nums.filter((n) => typeof n === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
};

const formatearFecha = (f) =>
  f ? new Date(f).toLocaleDateString("es-DO", { day: "numeric", month: "short" }) : "Sin fecha";
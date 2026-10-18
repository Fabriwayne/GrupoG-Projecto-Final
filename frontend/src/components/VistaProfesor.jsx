import Stat, { PortadaCurso, ui } from "./Stat";
import { haceCuanto } from "../utils/fechas";

/* 
  Props:
    cursos        -> [{ _id, title, image, totalEstudiantes, pendientesPorCalificar }]
                     (image es la URL de la portada y es opcional)
    cargando      -> boolean
    onCrearCurso  -> función que se ejecuta al pulsar "Crear curso" (por ejemplo, navegar a otra ruta)
    onGestionar   -> función (curso) => void que se ejecuta al pulsar "Gestionar"
*/
export default function VistaProfesor({
  cursos = [],
  cargando = false,
  onCrearCurso,
  onGestionar,
}) {
  const hayDato = (campo) => cursos.some((c) => c[campo] !== undefined);
  const totalEstudiantes = cursos.reduce((suma, c) => suma + (c.totalEstudiantes || 0), 0);
  const porCalificar = cursos.reduce((suma, c) => suma + (c.pendientesPorCalificar || 0), 0);
  const publicados = cursos.filter((c) => c.status === "published").length;
  const fechas = cursos.map((c) => c.updatedAt).filter(Boolean);
  const ultima = fechas.length ? haceCuanto(fechas.reduce((a, b) => (a > b ? a : b))) : "—";

  return (
    <>
      {/* Resumen */}
      <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className={`${ui.panel} p-5`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">Resumen</h2>
            <button className={ui.btn} onClick={onCrearCurso}>
              + Crear curso
            </button>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Stat icono="📚" tono="acento" valor={cursos.length} etiqueta={cursos.length === 1 ? "Curso publicado" : "Cursos publicados"} />
            <Stat icono="🕒" valor={ultima} etiqueta="Última actualización" />
            <Stat
              icono="✓"
              tono="bosque"
              valor={publicados}
              etiqueta="Cursos publicados"
              detalle={`${cursos.length - publicados} en borrador`}
              progreso={cursos.length ? (publicados / cursos.length) * 100 : 0}
            />
            {hayDato("totalEstudiantes") && <Stat icono="👥" tono="terracota" valor={totalEstudiantes} etiqueta="Estudiantes" />}
            {hayDato("pendientesPorCalificar") && <Stat icono="✓" tono="aviso" valor={porCalificar} etiqueta="Entregas por calificar" />}
          </div>
        </section>
      </div>

      {/* Cursos */}
      <section className={ui.bloque}>
        <div className={ui.bloqueCabecera}>
          <div>
            <h2>Mis cursos</h2>
            <p>Gestiona el contenido, las lecciones, capítulos y quizzes de cada curso.</p>
          </div>
        </div>

        {cargando ? (
          <p className={ui.vacio}>Cargando cursos…</p>
        ) : cursos.length === 0 ? (
          <div className={ui.vacioCaja}>
            <span className={ui.vacioIcono} aria-hidden="true">📚</span>
            <p className={ui.vacio}>Todavía no has creado cursos. Crea el primero para recibir estudiantes.</p>
            <button className={`${ui.btn} mt-4`} onClick={onCrearCurso}>
              Crear mi primer curso
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {cursos.map((c) => (
              <li
                key={c._id}
                className="flex flex-col overflow-hidden rounded-2xl border border-linea/70 bg-hoja transition hover:-translate-y-1 hover:shadow-lg"
              >
                <PortadaCurso curso={c} />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-[1.02rem] leading-snug">{c.title}</strong>
                    <span className={c.status === "published" ? ui.pildora : ui.aviso}>
                      {c.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </div>

                  {/* Jerarquía visual de Metadatos mejorada */}
                  <div className="flex flex-wrap items-center gap-2.5 text-[.86rem] text-tinta-suave">          
                    {c.updatedAt && <span>🕒 {haceCuanto(c.updatedAt)}</span>}
                    {c.totalEstudiantes !== undefined && <span>👥 {c.totalEstudiantes} estudiantes</span>}
                    {c.pendientesPorCalificar > 0 && (
                      <span className={ui.aviso}>{c.pendientesPorCalificar} por calificar</span>
                    )}
                  </div>

                  <div className="mt-auto pt-3">
                    <button className={`${ui.btn} w-full`} onClick={() => onGestionar?.(c)}>
                      Gestionar →
                    </button>
                  </div>
                </div>

              </li>
            ))}
            <li>
              <button
                className="grid size-full min-h-60 cursor-pointer place-items-center rounded-2xl border-[1.5px] border-dashed border-linea bg-transparent p-5 text-center text-tinta-suave transition hover:border-acento hover:bg-acento-suave/50 hover:text-acento"
                onClick={onCrearCurso}
              >
                <div>
                  <span className="text-[2rem] leading-none" aria-hidden="true">+</span>
                  <div className="font-semibold">Nuevo curso</div>
                </div>
              </button>
            </li>
          </ul>
        )}
      </section>
    </>
  );
}
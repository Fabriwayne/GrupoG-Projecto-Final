import { Link } from "react-router-dom"
import { Marca, ui } from "../components/Stat"

const VENTAJAS = [
  {
    icono: "🎓",
    titulo: "Para estudiantes",
    texto: "Sigue tu progreso en cada curso, revisa tus calificaciones y no pierdas ninguna entrega.",
  },
  {
    icono: "✎",
    titulo: "Para profesores",
    texto: "Crea cursos con portada, organiza lecciones paso a paso y gestiona todo desde un solo lugar.",
  },
  {
    icono: "▶",
    titulo: "Lecciones con video",
    texto: "Pega un enlace de YouTube y se reproduce dentro de la lección, sin salir de la plataforma.",
  },
]

const PASOS = [
  ["Crea tu cuenta", "Elige si eres estudiante o profesor. Toma menos de un minuto."],
  ["Arma o únete a un curso", "Los profesores publican cursos; los estudiantes se inscriben."],
  ["Aprende a tu ritmo", "Lecciones ordenadas, videos y tu progreso siempre visible."],
]

const seccion = "mx-auto max-w-[1120px] px-5 py-14"
const h2 = "mb-8 max-w-[22ch] font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight tracking-tight"

function Inicio() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-20 border-b-[1.5px] border-linea bg-papel/80 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-5 py-3.5">
          <Marca />
          <div className="flex items-center gap-2">
            <Link to="/login" className={`${ui.btnTexto} max-[520px]:hidden`}>
              Iniciar sesión
            </Link>
            <Link to="/registro" className={ui.btnPrimario}>
              Registrarme
            </Link>
          </div>
        </div>
      </nav>

      {/* ---------- Hero ---------- */}
      <header className="mx-auto grid max-w-[1120px] grid-cols-[1.05fr_.95fr] items-center gap-14 px-5 pt-[72px] pb-14 max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[900px]:pt-12">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-terracota-suave px-3 py-1.5 text-[.72rem] font-bold uppercase tracking-[.1em] text-terracota">
            ● Plataforma educativa
          </span>

          <h1 className="my-5 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-semibold leading-[1.02] tracking-tight">
            Aprende, enseña y{" "}
            <span className="italic text-terracota underline decoration-terracota/40 decoration-4 underline-offset-8">
              conecta.
            </span>
          </h1>

          <p className="mb-8 max-w-[34rem] text-lg leading-relaxed text-tinta-suave">
            Una plataforma donde profesores y estudiantes pueden aprender, compartir y crecer juntos.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/registro" className={ui.btnPrimarioGrande}>
              Empezar gratis →
            </Link>
            <Link to="/login" className={ui.btnSecundarioGrande}>
              Ya tengo cuenta
            </Link>
          </div>

        </div>

        {/* Ilustración: una vista previa de la app hecha con HTML */}
        <div className="relative mx-auto min-h-[440px] w-full max-[900px]:min-h-[400px] max-[900px]:max-w-[480px]" aria-hidden="true">
          <div className={`${ui.tarjeta} absolute inset-x-[30px] top-5 overflow-hidden shadow-papel-lg max-[520px]:inset-x-0 max-[520px]:top-0`}>
            <div className="flex h-[150px] items-end bg-[radial-gradient(circle_at_85%_20%,rgb(255_255_255/.35)_0_40px,transparent_41px),linear-gradient(135deg,var(--color-terracota),var(--color-bosque))] px-5 py-[18px] text-white">
              <span className="font-display text-[1.6rem] font-semibold">Matemática I</span>
            </div>
            <div className="px-5 pt-[18px] pb-5">
              <div className="mb-2.5 flex justify-between text-[.9rem]">
                <strong>Lección 3 · Ecuaciones</strong>
                <span className="font-bold text-terracota">72%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-terracota-suave">
                <i className="block h-full w-[72%] rounded-full bg-terracota" />
              </div>
              <ol className="mt-4 grid gap-2 text-[.9rem]">
                <li className="flex items-center gap-2.5 text-tinta-suave">
                  <span className="size-[18px] shrink-0 rounded-full bg-bosque" />
                  Números enteros
                </li>
                <li className="flex items-center gap-2.5 text-tinta-suave">
                  <span className="size-[18px] shrink-0 rounded-full bg-bosque" />
                  Fracciones
                </li>
                <li className="flex items-center gap-2.5 font-semibold">
                  <span className="size-[18px] shrink-0 rounded-full border-2 border-terracota shadow-[inset_0_0_0_3px_var(--color-hoja),inset_0_0_0_9px_var(--color-terracota)]" />
                  Ecuaciones de primer grado
                </li>
              </ol>
            </div>
          </div>

          <div className={`${ui.tarjeta} absolute -right-1.5 bottom-[34px] flex animate-flotar items-center gap-3 px-[18px] py-3.5 motion-reduce:animate-none max-[520px]:right-0`}>
            <span className="grid size-10 place-items-center rounded-[3px] bg-bosque-suave text-xl text-bosque">★</span>
            <div>
              <strong className="block text-[.78rem] font-semibold text-tinta-suave">Promedio</strong>
              <span className="font-display text-2xl font-semibold">91.0</span>
            </div>
          </div>

          <div className={`${ui.tarjeta} absolute -left-1.5 bottom-0 flex animate-flotar-lento items-center gap-3 px-4 py-3 motion-reduce:animate-none max-[520px]:left-0`}>
            <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-bosque text-[.8rem] font-bold text-hoja">ED</span>
            <div>
              <strong className="block text-[.88rem]">Nueva lección publicada</strong>
              <span className="text-[.78rem] text-tinta-suave">Prof. Elizabeth · hace 2 min</span>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Ventajas ---------- */}
      <section className={seccion}>
        <h2 className={h2}>Todo lo que necesitas para aprender y enseñar</h2>
        <div className="grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-1">
          {VENTAJAS.map((v) => (
            <article key={v.titulo} className={`${ui.tarjeta} p-7 transition hover:-translate-y-1 hover:shadow-papel-lg`}>
              <span className="grid size-12 place-items-center rounded-[3px] bg-terracota-suave text-2xl text-terracota" aria-hidden="true">
                {v.icono}
              </span>
              <h3 className="mt-5 mb-2 font-display text-xl font-semibold tracking-tight">{v.titulo}</h3>
              <p className="leading-relaxed text-tinta-suave">{v.texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Pasos ---------- */}
      <section className={seccion}>
        <h2 className={h2}>Cómo funciona</h2>
        <ol className="grid grid-cols-3 gap-8 max-[900px]:grid-cols-1">
          {PASOS.map(([titulo, texto], i) => (
            <li key={titulo} className="border-t-2 border-tinta pt-5">
              <span className="font-display text-[2.6rem] font-semibold leading-none text-terracota">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3.5 mb-1.5 font-display text-lg font-semibold tracking-tight">{titulo}</h3>
              <p className="leading-relaxed text-tinta-suave">{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Llamado final ---------- */}
      <section className={seccion}>
        <div className="rounded-[6px] border-[1.5px] border-tinta bg-bosque px-10 py-14 text-center text-hoja shadow-papel-lg max-[520px]:px-[22px] max-[520px]:py-10">
          <h2 className="mb-2.5 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-tight">¿Listo para empezar?</h2>
          <p className="mb-7 text-[1.05rem] opacity-75">Únete a EduConnect hoy y lleva tus clases a otro nivel.</p>
          <Link
            to="/registro"
            className="inline-flex items-center rounded-full border-[1.5px] border-tinta bg-hoja px-7 py-[15px] text-[1.02rem] font-semibold text-tinta no-underline shadow-tinta transition hover:-translate-x-px hover:-translate-y-px hover:shadow-tinta-lg"
          >
            Crear mi cuenta
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-linea px-5 pt-8 pb-24 text-[.9rem] text-tinta-suave">
        <Marca />
        <span>Proyecto final · Grupo G</span>
      </footer>
    </div>
  )
}

export default Inicio

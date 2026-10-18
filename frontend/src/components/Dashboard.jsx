import { useNavigate, Link } from "react-router-dom";
import VistaEstudiante from "./VistaEstudiante";
import VistaProfesor from "./VistaProfesor";
import { BarraApp, Icono, ui } from "./Stat";
import EncabezadoPanel from "./EncabezadoPanel";
import { fechaLarga, saludoSegunHora } from "../utils/fechas";

// Roles del backend -> vista que se muestra. Lo que no esté aquí (ej. admin) usa la vista de estudiante.
const ROLES = {
  student: "estudiante",
  teacher: "profesor",
};

/*
  Área personal (dashboard). Aquí viven los cursos y las herramientas de trabajo.
  Los datos personales de la cuenta NO se muestran aquí: eso es del Perfil (/perfil).

  Props:
    usuario            -> { username, email, role }
    cursos             -> cursos del estudiante (inscritos) o del profesor (creados), según el rol
    tareas             -> tareas del estudiante (solo se usa en la vista de estudiante)
    cargando           -> boolean, para los datos de cursos y tareas
    onCrearCurso       -> () => void (vista de profesor)
    onGestionarCurso   -> (curso) => void (vista de profesor)
    onCerrarSesion     -> () => void. Se ejecuta al pulsar "Cerrar sesión"
*/
export default function Dashboard({
  usuario,
  cursos = [],
  tareas = [],
  cargando = false,
  onCrearCurso,
  inscripciones = [],
  onAbrirCurso,
  onGestionarCurso,
  onCerrarSesion,
}) {
  if (!usuario) return null;

  const navigate = useNavigate();

  const rol = ROLES[String(usuario.role || "").toLowerCase()] || "estudiante";
  const ini = iniciales(usuario.username || usuario.email);
  const n = rol === "profesor" ? cursos.length : inscripciones.filter((i) => i.course).length;
  const resumen = cargando
    ? "Cargando tus cursos…"
    : rol === "profesor"
      ? n === 0
        ? "Aún no has creado cursos. ¡Empieza con el primero!"
        : `Tienes ${n} ${n === 1 ? "curso publicado" : "cursos publicados"}.`
      : n === 0
        ? "Cuando te inscribas en un curso, lo verás aquí."
        : `Estás inscrito en ${n} ${n === 1 ? "curso" : "cursos"}.`;

  return (
    <main className={`${ui.pagina} ${rol === "profesor" ? ui.profesor : ""}`}>
      <BarraApp rol={rol} usuario={usuario}>
        <Link to="/perfil" className={`${ui.btnTexto} gap-2.5 py-1.5`} title="Ir a mi perfil">
          <span className="grid size-9 place-items-center rounded-full bg-acento text-[.78rem] font-bold text-hoja lg:hidden" aria-hidden="true">
            {ini}
          </span>
          <span className="max-sm:hidden" user>Mi perfil</span>
        </Link>
        <button className={ui.btnGhost} onClick={onCerrarSesion}>
          <Icono nombre="salir" className="size-4" />
          <span className="max-sm:hidden">Cerrar sesión</span>
        </button>
      </BarraApp>

      <div className={ui.contenedor}>

        <EncabezadoPanel
          fecha={fechaLarga()}
          saludo={saludoSegunHora()}
          nombre={usuario.username}
          rol={rol}
          resumen={resumen}
        />

        {rol === "profesor" ? (
          <VistaProfesor
            cursos={cursos}
            cargando={cargando}
            onCrearCurso={onCrearCurso}
            onGestionar={onGestionarCurso}
          />
        ) : (
          <VistaEstudiante
            inscripciones={inscripciones}
            tareas={tareas}
            cargando={cargando}
            onExplorar={() => navigate("/catalogo")}
            onAbrirCurso={onAbrirCurso}
          />
        )}
      </div>
    </main>
  );
}

const iniciales = (texto = "") =>
  texto
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

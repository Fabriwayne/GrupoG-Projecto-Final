import { Link, useLocation } from "react-router-dom";

/*
  Piezas visuales pequeñas que se reutilizan en varias pantallas:
    ui            -> clases de Tailwind que se repiten (botones, tarjetas, formularios...)
    Stat          -> tarjeta con un número y su etiqueta (perfil de estudiante y de profesor)
    Marca         -> logo + nombre de la plataforma
    BarraApp      -> barra superior del área privada
    AuthLayout    -> diseño de dos columnas de Login y Registro
    PortadaCurso  -> portada de un curso (imagen o una generada con las iniciales)

  Los colores (bg-papel, text-tinta, bg-acento...) están definidos en index.css.
*/

/* ---------------- Clases compartidas ---------------- */
const boton =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] font-semibold leading-tight no-underline transition active:translate-y-px disabled:cursor-default disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acento";
const botonPrincipal = `${boton} border-tinta bg-acento text-hoja shadow-tinta hover:-translate-x-px hover:-translate-y-px hover:shadow-tinta-lg`;
const tarjeta = "rounded-[4px] border-[1.5px] border-linea bg-hoja shadow-papel";
// Tarjeta del área privada (panel): más limpia y redondeada, estilo dashboard
const panel = "rounded-2xl border border-linea/70 bg-hoja shadow-[0_1px_2px_rgb(42_33_24/.04),0_8px_24px_rgb(42_33_24/.06)]";
// Botones del área privada: planos y redondeados
const botonPanel =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-4 py-2.5 text-[.92rem] font-semibold leading-tight no-underline transition active:translate-y-px disabled:cursor-default disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acento";
const campo =
  "rounded-[3px] border-[1.5px] border-linea bg-hoja px-3.5 py-3 font-normal text-tinta transition placeholder:text-tinta-suave/70 focus:border-acento focus:outline-none focus:ring-4 focus:ring-acento-suave";

// eslint-disable-next-line react-refresh/only-export-components
export const ui = {
  // Botones de la página de inicio y de Login/Registro
  btnPrimario: `${botonPrincipal} px-5 py-[11px] text-[.95rem]`,
  btnPrimarioGrande: `${botonPrincipal} px-7 py-[15px] text-[1.02rem]`,
  btnSecundarioGrande: `${boton} border-linea bg-hoja px-7 py-[15px] text-[1.02rem] text-tinta hover:border-tinta-suave`,
  btnTexto:
    "inline-flex cursor-pointer items-center rounded-full border-0 bg-transparent px-3 py-[11px] text-[.95rem] font-semibold text-tinta-suave no-underline hover:text-tinta",

  // Botones del área privada
  btn: `${botonPanel} border-acento bg-acento text-hoja shadow-sm hover:brightness-110`,
  btnGhost: `${botonPanel} border-linea bg-hoja text-tinta hover:border-acento/50 hover:bg-acento-suave/40`,
  btnPeligro: `${botonPanel} border-peligro bg-peligro text-white shadow-sm hover:brightness-110`,
  link: "cursor-pointer border-0 bg-transparent p-0 font-bold text-acento no-underline hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acento",
  linkPeligro: "cursor-pointer border-0 bg-transparent p-0 font-bold text-peligro no-underline hover:underline",

  // Estructura
  // Área privada: fondo liso y espacio a la izquierda para el menú lateral (BarraApp)
  pagina: "min-h-screen bg-[#f3eee5] text-tinta lg:pl-[264px]",
  profesor: "[--acento:var(--color-bosque)] [--acento-suave:var(--color-bosque-suave)]",
  contenedor: "mx-auto max-w-[1200px] px-6 pt-7 pb-30 max-sm:px-4 max-sm:pt-5",
  contenedorEstrecho: "mx-auto max-w-[820px] px-6 pt-7 pb-30 max-sm:px-4 max-sm:pt-5",
  tarjeta,
  panel,
  bloque: `${panel} mb-5 p-6 max-sm:p-5 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight`,
  bloquePeligro:
    "mb-5 rounded-2xl border border-peligro-linea bg-peligro-suave p-6 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-peligro [&_p]:mb-3.5",
  bloqueCabecera:
    "mb-[18px] flex flex-wrap items-center justify-between gap-3 [&_h2]:mb-0! [&_p]:mt-0.5 [&_p]:text-[.9rem] [&_p]:text-tinta-suave",
  acciones: "flex flex-wrap items-center gap-2",
  titulo: "m-0 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-tight tracking-tight",
  subtitulo: "mt-1 mb-2.5 text-tinta-suave",
  etiqueta: "mb-1 text-[.85rem] font-semibold uppercase tracking-[.08em] text-acento",
  descripcion: "m-0 whitespace-pre-wrap leading-[1.7]",

  // Formularios
  // Estiliza los <label>, <input> y <textarea> que estén dentro del formulario
  form: [
    "[&_label]:mb-4 [&_label]:flex [&_label]:flex-col [&_label]:gap-[7px] [&_label]:text-[.88rem] [&_label]:font-semibold",
    "[&_input]:rounded-[3px] [&_input]:border-[1.5px] [&_input]:border-linea [&_input]:bg-hoja [&_input]:px-3.5 [&_input]:py-3 [&_input]:font-normal [&_input]:text-tinta",
    "[&_input]:placeholder:text-tinta-suave/70 [&_input]:focus:border-acento [&_input]:focus:outline-none [&_input]:focus:ring-4 [&_input]:focus:ring-acento-suave",
    "[&_textarea]:resize-y [&_textarea]:rounded-[3px] [&_textarea]:border-[1.5px] [&_textarea]:border-linea [&_textarea]:bg-hoja [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:font-normal [&_textarea]:text-tinta",
    "[&_textarea]:placeholder:text-tinta-suave/70 [&_textarea]:focus:border-acento [&_textarea]:focus:outline-none [&_textarea]:focus:ring-4 [&_textarea]:focus:ring-acento-suave",
  ].join(" "),
  campo: "flex flex-col gap-[7px] [&>span]:text-[.88rem] [&>span]:font-semibold",
  // "peer" deja que la burbuja que va después del input sepa si el input está mal.
  // user-invalid: el navegador marcó el campo como mal escrito (solo después de que la persona lo toca)
  // aria-invalid: el servidor dijo que ese campo está mal (lo marca el formulario)
  input: `peer w-full ${campo} user-invalid:border-peligro user-invalid:bg-peligro-suave/40 user-invalid:focus:ring-peligro/15 aria-invalid:border-peligro aria-invalid:bg-peligro-suave/40 aria-invalid:focus:ring-peligro/15`,
  // Burbuja de un campo que solo aparece cuando el navegador marca ese campo como inválido
  burbujaCampo: "hidden peer-user-invalid:flex",

  // Mensajes y estados (los errores de los formularios se ven como burbuja roja)
  error:
    "mb-3 flex animate-burbuja items-start gap-2 rounded-[3px] border-[1.5px] border-peligro bg-peligro-suave px-3 py-2 text-[.88rem] font-semibold text-peligro shadow-[2px_2px_0_var(--color-peligro)] before:grid before:size-5 before:shrink-0 before:place-items-center before:rounded-full before:bg-peligro before:text-[.75rem] before:font-bold before:text-white before:content-['!']",
  vacio: "m-0 text-tinta-suave",
  vacioCaja: "rounded-2xl border-[1.5px] border-dashed border-linea bg-papel/50 px-4 py-9 text-center",
  vacioIcono: "mb-2 block text-[2rem]",
  estado: "grid min-h-[70vh] place-items-center p-6 text-center text-tinta-suave",
  spinner: "mx-auto mb-3.5 size-[34px] animate-spin rounded-full border-3 border-linea border-t-acento",
  errorCaja:
    "m-0 rounded-[3px] border-[1.5px] border-peligro-linea bg-peligro-suave px-3.5 py-2.5 text-[.9rem] text-peligro",
  aviso: "whitespace-nowrap rounded-full bg-aviso px-2.5 py-0.5 text-[.76rem] font-bold text-aviso-tinta",
  published: "inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm",
  // Etiqueta verde para estados positivos ("Publicado", "Inscrito", "Completada")
  pildora: "inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-bosque-suave px-2.5 py-0.5 text-[.76rem] font-bold text-bosque",
};

/* ---------------- Mensajes de error ---------------- */

/*
  Burbuja roja con flecha que apunta al campo que hay que corregir.
  className cambia cómo se muestra: por defecto siempre visible; con ui.burbujaCampo
  solo aparece cuando el campo de arriba está mal escrito.
*/
export function Burbuja({ children, className = "flex", ...props }) {
  return (
    <span
      className={`relative mt-1 animate-burbuja items-start gap-2 rounded-[3px] border-[1.5px] border-peligro bg-peligro-suave px-3 py-2 text-[.86rem] font-semibold leading-snug text-peligro shadow-[2px_2px_0_var(--color-peligro)] before:absolute before:-top-[7.5px] before:left-4 before:size-3 before:rotate-45 before:border-t-[1.5px] before:border-l-[1.5px] before:border-peligro before:bg-peligro-suave before:content-[''] ${className}`}
      {...props}
    >
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-peligro text-[.75rem] font-bold text-white" aria-hidden="true">
        !
      </span>
      <span>{children}</span>
    </span>
  );
}

// Evita el globito gris del navegador; en su lugar se ve nuestra burbuja roja.
// eslint-disable-next-line react-refresh/only-export-components
export const sinGloboDelNavegador = (e) => e.preventDefault();

/*
  El backend responde en inglés. Esto lo pasa a español y dice qué campo marcar en rojo.
  Devuelve { campo, texto }. campo puede ser "email", "password", "username" o "" (error general).
*/
// eslint-disable-next-line react-refresh/only-export-components
export function traducirError(mensaje = "") {
  const errores = {
    "User not found": ["email", "No existe ninguna cuenta con este correo. Revisa que esté bien escrito o regístrate."],
    "Invalid credentials": ["password", "La contraseña no es correcta. Revísala e inténtalo de nuevo."],
    "User already exists": ["email", "Ya existe una cuenta con este correo. Usa otro o inicia sesión."],
    "Username already taken": ["username", "Ese nombre de usuario ya está en uso; prueba con otro."],
    "Password must be at least 8 characters": ["password", "La contraseña debe tener al menos 8 caracteres."],
    "Invalid data": ["", "Revisa los datos del formulario e inténtalo de nuevo."],
    // El backend solo revisa el correo; si falla al guardar, casi siempre es un nombre de usuario repetido
    "Error registering user": ["username", "No pudimos crear la cuenta. Puede que ese nombre de usuario ya esté en uso; prueba con otro."],
    "Error logging in user": ["", "No pudimos iniciar sesión. Inténtalo de nuevo en un momento."],
    "All fields are required": ["", "Completa todos los campos para continuar."],
    // fetch no pudo llegar al backend (casi siempre porque no está encendido)
    "Failed to fetch": ["", "No pudimos comunicarnos con el servidor de EduConnect. Puede que esté apagado; inténtalo de nuevo en un momento."],
  };
  const [campo, texto] = errores[mensaje] || ["", mensaje || "Algo salió mal. Inténtalo de nuevo."];
  return { campo, texto };
}

/* ---------------- Componentes ---------------- */

// Colores de cada tarjeta de estadística (clases escritas completas para que Tailwind las genere)
const TONOS = {
  acento: { fondo: "from-acento-suave/70", chip: "bg-acento-suave text-acento", barra: "bg-acento", pista: "bg-acento-suave" },
  terracota: { fondo: "from-terracota-suave/70", chip: "bg-terracota-suave text-terracota", barra: "bg-terracota", pista: "bg-terracota-suave" },
  bosque: { fondo: "from-bosque-suave/80", chip: "bg-bosque-suave text-bosque", barra: "bg-bosque", pista: "bg-bosque-suave" },
  aviso: { fondo: "from-aviso/60", chip: "bg-aviso text-aviso-tinta", barra: "bg-aviso-tinta", pista: "bg-aviso" },
};

/*
  Tarjeta de estadística del panel.
    valor, etiqueta, icono -> lo que se muestra
    tono      -> "acento" | "terracota" | "bosque" | "aviso"
    detalle   -> texto pequeño debajo del número (opcional)
    progreso  -> número de 0 a 100; si viene, se dibuja una barra (opcional)
*/
export default function Stat({ valor, etiqueta, icono, tono = "acento", detalle, progreso }) {
  const t = TONOS[tono] || TONOS.acento;
  return (
    <div className={`rounded-2xl border border-linea/70 bg-linear-to-br ${t.fondo} via-hoja to-hoja p-4 transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-center gap-2.5">
        {icono && (
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-base ${t.chip}`} aria-hidden="true">
            {icono}
          </span>
        )}
        <span className="text-[.88rem] font-semibold text-tinta-suave">{etiqueta}</span>
      </div>
      <strong className="mt-3 block font-display text-[2rem] font-semibold leading-none tracking-tight">{valor}</strong>
      {detalle && <span className="mt-1.5 block text-[.8rem] text-tinta-suave">{detalle}</span>}
      {typeof progreso === "number" && (
        <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${t.pista}`}>
          <div className={`h-full rounded-full ${t.barra}`} style={{ width: `${Math.min(100, Math.max(0, progreso))}%` }} />
        </div>
      )}
    </div>
  );
}

/* ---------------- Íconos del menú (trazos simples en SVG) ---------------- */
const ICONOS = {
  panel: "M4 4h7v7H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 13h7v7H4z",
  libro: "M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15ZM5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7h6",
  mas: "M12 5v14M5 12h14",
  casa: "M4 10.5 12 4l8 6.5M6 9.5V20h12V9.5M10 20v-5h4v5",
  menu: "M4 7h16M4 12h16M4 17h16",
  salir: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
};

export function Icono({ nombre, className = "size-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={ICONOS[nombre]} />
    </svg>
  );
}

// Logo + nombre de la plataforma. "invertida" es para usarla sobre un fondo de color.
export function Marca({ to = "/", invertida = false }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 font-display text-[1.15rem] font-bold tracking-tight no-underline ${invertida ? "text-hoja" : "text-tinta"
        }`}
    >
      <span
        className={`grid size-[34px] shrink-0 place-items-center rounded-[3px] ${invertida ? "bg-hoja text-bosque" : "bg-acento text-hoja"
          }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
          <path d="M2 8.5 12 3l10 5.5-10 5.5L2 8.5Z" />
          <path d="M5.5 11.6v4.9c0 2 2.9 3.5 6.5 3.5s6.5-1.5 6.5-3.5v-4.9L12 15.2l-6.5-3.6Z" opacity=".75" />
        </svg>
      </span>
      EduConnect
    </Link>
  );
}

// Opciones del menú lateral según el rol
const MENU = {
  profesor: [
    { to: "/dashboard", texto: "Mis cursos", icono: "panel" },
    { to: "/cursos/nuevo", texto: "Crear curso", icono: "mas" },
    { to: "/perfil", texto: "Mi perfil", icono: "user" }
  ],
  estudiante: [
    { to: "/dashboard", texto: "Panel", icono: "panel" },
    { to: "/catalogo", texto: "Catálogo de cursos", icono: "libro" },
    { to: "/perfil", texto: "Mi perfil", icono: "user" }
  ],
};

const CONSEJOS = {
  profesor: "Los cursos en borrador no aparecen en el catálogo. Publícalos cuando estén listos para tus estudiantes.",
  estudiante: "Marca cada lección como completada al terminarla para que tu progreso se actualice.",
};

/*
  Menú lateral fijo a la izquierda + barra superior (área privada).
    rol      -> "profesor" | "estudiante". Decide las opciones del menú.
    usuario  -> { username, email } opcional. Si viene, se muestra arriba del menú.
    children -> lo que va a la derecha de la barra superior (ej. "Cerrar sesión")
  En pantallas pequeñas el menú lateral se esconde y aparece un botón ☰ que lo abre.
*/
export function BarraApp({ rol = "estudiante", usuario, children }) {
  const { pathname } = useLocation();
  const esProfesor = rol === "profesor" || rol === "teacher";
  const opciones = MENU[esProfesor ? "profesor" : "estudiante"];
  // "Panel" queda marcado también en las páginas internas (gestionar curso, aprender, quizzes...)
  const activo = (to) => pathname === to || (to === "/perfil" && !opciones.some((o) => o.to === pathname));
  const hoy = new Date().toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" });

  const enlaces = (
    <nav className="flex flex-col gap-1">
      <p className="px-3 pb-1.5 text-[.7rem] font-bold uppercase tracking-[.14em] text-tinta-suave/80">Menú</p>
      {opciones.map((o) => (
        <Link
          key={o.to}
          to={o.to}
          aria-current={activo(o.to) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[.95rem] font-semibold no-underline transition ${activo(o.to) ? "bg-acento text-hoja shadow-sm" : "text-tinta-suave hover:bg-acento-suave/60 hover:text-tinta"
            }`}
        >
          <Icono nombre={o.icono} />
          {o.texto}
        </Link>
      ))}
      <p className="mt-4 px-3 pb-1.5 text-[.7rem] font-bold uppercase tracking-[.14em] text-tinta-suave/80">General</p>
      <Link
        to="/"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[.95rem] font-semibold text-tinta-suave no-underline transition hover:bg-acento-suave/60 hover:text-tinta"
      >
        <Icono nombre="casa" />
        Página de inicio
      </Link>
    </nav>
  );

  return (
    <>
      {/* Menú lateral (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col gap-5 overflow-y-auto border-r border-linea/70 bg-hoja px-4 py-5 lg:flex">
        <div className="px-2">
          <Marca />
        </div>

        {usuario && (
          <div className="flex items-center gap-3 rounded-2xl bg-papel px-3 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-acento text-[.85rem] font-bold text-hoja">
              {inicialesDe(usuario.username || usuario.email)}
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-[.95rem]">{usuario.username}</strong>
              <span className="block text-[.78rem] font-semibold text-acento">{esProfesor ? "Profesor" : "Estudiante"}</span>
            </span>
          </div>
        )}

        {enlaces}

        <div className="relative mt-auto overflow-hidden rounded-2xl bg-acento p-4 text-hoja after:absolute after:-right-8 after:-bottom-8 after:size-28 after:rounded-full after:bg-white/10 after:content-['']">
          <strong className="block font-display text-lg font-semibold">Consejo</strong>
          <p className="relative mt-1 text-[.85rem] leading-snug opacity-90">{CONSEJOS[esProfesor ? "profesor" : "estudiante"]}</p>
        </div>
      </aside>

      {/* Barra superior */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-linea/70 bg-[#f3eee5]/85 px-6 backdrop-blur-md max-sm:px-4">
        {/* Menú en pantallas pequeñas: <details> se abre y se cierra solo, sin estado */}
        <details className="relative lg:hidden">
          <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-linea bg-hoja text-tinta [&::-webkit-details-marker]:hidden" aria-label="Abrir menú">
            <Icono nombre="menu" />
          </summary>
          <div className="absolute top-12 left-0 z-40 w-64 rounded-2xl border border-linea/70 bg-hoja p-3 shadow-xl">{enlaces}</div>
        </details>
        <div className="lg:hidden">
          <Marca to="/perfil" />
        </div>
        <p className="hidden text-[.9rem] text-tinta-suave first-letter:uppercase lg:block">{hoy}</p>
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </header>
    </>
  );
}

const inicialesDe = (texto = "") =>
  texto
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

// Diseño de dos columnas para Login y Registro: panel de marca a la izquierda, formulario a la derecha.
export function AuthLayout({ titulo, subtitulo, pie, children }) {
  return (
    <main className="grid min-h-screen grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] max-[860px]:grid-cols-1">
      <aside className="relative flex flex-col justify-between gap-10 overflow-hidden border-r-[1.5px] border-tinta bg-bosque px-12 py-10 text-hoja after:pointer-events-none after:absolute after:-right-[120px] after:-bottom-[120px] after:size-[380px] after:rounded-full after:bg-[radial-gradient(circle,rgb(255_255_255/.18),transparent_70%)] after:content-[''] max-[860px]:hidden">
        <Marca invertida />
        <div>
          <p className="mb-3.5 max-w-[20ch] font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-semibold italic leading-tight tracking-tight">
            “La educación es el arma más poderosa que puedes usar para cambiar el mundo.”
          </p>
          <span className="text-[.95rem] opacity-75">— Nelson Mandela</span>
        </div>
        <ul className="grid gap-3 text-[.95rem]">
          {["Cursos organizados por lecciones", "Videos integrados en cada lección", "Progreso y calificaciones en tiempo real"].map(
            (texto) => (
              <li key={texto} className="flex items-center gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-bold" aria-hidden="true">
                  ✓
                </span>
                {texto}
              </li>
            )
          )}
        </ul>
      </aside>

      <section className="flex flex-col items-center justify-center px-6 pt-12 pb-24 max-[860px]:justify-start max-[860px]:pt-7">
        <div className="mb-10 hidden w-full max-w-[420px] max-[860px]:block">
          <Marca />
        </div>
        <div className="w-full max-w-[420px]">
          <h1 className="mb-2 font-display text-[2.2rem] font-semibold leading-tight tracking-tight">{titulo}</h1>
          <p className="mb-8 text-tinta-suave">{subtitulo}</p>
          {children}
          {pie && (
            <p className="mt-7 text-center text-[.92rem] text-tinta-suave [&_a]:font-bold [&_a]:text-acento [&_a]:no-underline [&_a:hover]:underline">
              {pie}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

// Portada de un curso. Si no tiene imagen, genera una con los colores del diseño y las iniciales del título.
export function PortadaCurso({ curso, grande = false }) {
  const imagen = curso.image || curso.coverImage;
  const tamano = grande ? "h-[220px]" : "aspect-[16/8]";

  if (imagen) {
    return (
      <div className={`relative overflow-hidden bg-hoja-2 ${tamano}`}>
        <img src={imagen} alt="" className="block size-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-end overflow-hidden border-b-[1.5px] border-linea font-display font-semibold tracking-tight text-white after:absolute after:-top-[30px] after:-right-[30px] after:size-[130px] after:rounded-full after:border-[18px] after:border-white/20 after:content-[''] ${tamano} ${grande ? "px-7 py-6 text-[clamp(2rem,5vw,3rem)]" : "px-4 py-3.5 text-[1.6rem]"
        } ${DEGRADADOS[variante(curso.title)]}`}
      aria-hidden="true"
    >
      {iniciales(curso.title)}
    </div>
  );
}

const DEGRADADOS = [
  "bg-linear-135 from-terracota to-bosque",
  "bg-linear-135 from-bosque to-[#8e5225]",
  "bg-linear-135 from-terracota to-[#6e2f13]",
];

// Elige siempre la misma variante de color para el mismo título
const variante = (texto = "") => [...texto].reduce((s, c) => s + c.charCodeAt(0), 0) % 3;

const PALABRAS_CORTAS = ["a", "al", "de", "del", "el", "en", "la", "las", "los", "y"];

const iniciales = (texto = "") =>
  texto
    .split(/\s+/)
    .filter((p) => p && !PALABRAS_CORTAS.includes(p.toLowerCase()))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || texto.slice(0, 2).toUpperCase();
import { ui } from "./Stat";

export default function EncabezadoPanel({ fecha, saludo, nombre, rol, resumen }) {
    return (
        <header className={`${ui.tarjeta} relative mb-6 overflow-hidden p-7 pl-9 max-sm:p-5 max-sm:pl-7`}>
            {/* Barra con el color del rol (profesor/estudiante) */}
            <span className="absolute inset-y-0 left-0 w-2.5 border-r-[1.5px] border-tinta bg-acento" aria-hidden="true" />
            <h1 className={ui.titulo}>Panel</h1>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className={ui.etiqueta}>{fecha}</p>
                    <h1 className={ui.titulo}>Hola, {saludo}, {nombre}</h1>
                    <p className={`${ui.subtitulo} mb-0`}>{resumen}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-acento-suave px-3 py-1 text-[.8rem] font-bold text-acento before:size-1.75 before:rounded-full before:bg-current before:content-['']">
                    {rol === "profesor"
                        ? "Gestiona tus cursos, capítulos y quizzes desde un solo lugar."
                        : "Sigue tu progreso y continúa tus cursos desde un solo lugar."}
                </span>
            </div>
        </header>
    );
}

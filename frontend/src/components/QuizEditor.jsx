import { useState } from "react";
import { ui, BarraApp } from "./Stat"; // ajusta la ruta a tu archivo Stat.jsx

const MIN_OPCIONES = 2;
const MAX_OPCIONES = 6;

/*
  Pantalla del profesor para crear o editar el quiz final de un curso.
  No llama a la API: todo entra por props.

  Props:
    quiz        -> null para crear uno nuevo. Para editar:
                   { _id, title, description, maxAttempts, published,
                     questions: [{ _id, question, options: [string], correctAnswer: number, points }] }
                   correctAnswer es la POSICIÓN (0, 1, 2…) de la opción correcta dentro de options.
    cursoTitulo -> string. Opcional; se muestra como contexto arriba ("Quiz de: …").
    cargando    -> boolean, mientras llega el quiz que se va a editar
    error       -> string. Error al cargar; si tiene valor, se muestra en lugar del formulario
    onGuardar   -> async ({ title, description, maxAttempts, published, questions }) => void.
                   Debe lanzar un error si falla. Cada pregunta se envía como
                   { _id?, question, options, correctAnswer, points } (el _id solo existe al editar).
    onEliminar  -> async () => void. Opcional: si no se pasa, no aparece el botón de eliminar.
                   Debe lanzar un error si falla.
    onVolver    -> () => void. "← Volver al curso"
*/
export default function QuizEditor({
  quiz = null,
  cursoTitulo = "",
  cargando = false,
  error = "",
  onGuardar,
  onEliminar,
  onVolver,
}) {
  const esEdicion = Boolean(quiz?._id);

  const volver = (
    <button className={`${ui.link} mb-4`} onClick={onVolver}>
      ← Volver al curso
    </button>
  );

  return (
    <div className={`${ui.pagina} ${ui.profesor}`}>
      <BarraApp rol="profesor"/>
      <main className={ui.contenedor}>
        {volver}

        <header className="mb-6">
          <h1 className={ui.titulo}>{esEdicion ? "Editar quiz final" : "Crear quiz final"}</h1>
          <p className={ui.subtitulo}>
            {cursoTitulo ? `Curso: ${cursoTitulo}. ` : ""}
            Cada pregunta tiene una sola respuesta correcta.
          </p>
        </header>

        {cargando ? (
          <div className="py-10 text-center text-tinta-suave">
            <div className={ui.spinner} />
            Cargando quiz…
          </div>
        ) : error ? (
          <p className={ui.errorCaja}>{error}</p>
        ) : (
          // key: si cambia de quiz, el formulario se reinicia con los datos nuevos
          <Formulario key={quiz?._id ?? "nuevo"} quiz={quiz} onGuardar={onGuardar} onEliminar={onEliminar} />
        )}
      </main>
    </div>
  );
}

/* ---------- Formulario ---------- */
let contador = 0;
const nuevaClave = () => `k${++contador}`; // clave local para el key de React; no se envía al backend

const preguntaVacia = () => ({
  clave: nuevaClave(),
  question: "",
  options: ["", ""],
  correctAnswer: 0,
  points: 1,
});

const desdeBackend = (q) => ({
  clave: nuevaClave(),
  _id: q._id,
  question: q.question ?? "",
  options: q.options?.length ? [...q.options] : ["", ""],
  correctAnswer: q.correctAnswer ?? 0,
  points: q.points ?? 1,
});

function Formulario({ quiz, onGuardar, onEliminar }) {
  const [form, setForm] = useState({
    title: quiz?.title ?? "",
    description: quiz?.description ?? "",
    maxAttempts: quiz?.maxAttempts ?? 3,
    published: quiz?.published ?? false,
  });
  const [preguntas, setPreguntas] = useState(() =>
    quiz?.questions?.length ? quiz.questions.map(desdeBackend) : [preguntaVacia()]
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const actualizarPregunta = (clave, cambios) =>
    setPreguntas((ps) => ps.map((p) => (p.clave === clave ? { ...p, ...cambios } : p)));

  const quitarPregunta = (clave) => setPreguntas((ps) => ps.filter((p) => p.clave !== clave));

  const mover = (indice, delta) =>
    setPreguntas((ps) => {
      const destino = indice + delta;
      if (destino < 0 || destino >= ps.length) return ps;
      const copia = [...ps];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });

  const totalPuntos = preguntas.reduce((suma, p) => suma + (Number(p.points) || 0), 0);

  const enviar = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const maxAttempts = Number(form.maxAttempts);

    // Mismas reglas que el modelo del backend, para avisar antes de enviar
    if (!title) return setError("El quiz necesita un título.");
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1)
      return setError("Los intentos deben ser un número entero de 1 o más.");
    if (preguntas.length === 0) return setError("El quiz debe tener al menos una pregunta.");

    const questions = [];
    for (let i = 0; i < preguntas.length; i++) {
      const p = preguntas[i];
      const n = i + 1;
      const opciones = p.options.map((o) => o.trim());
      const puntos = Number(p.points);

      if (!p.question.trim()) return setError(`La pregunta ${n} necesita un enunciado.`);
      if (opciones.length < MIN_OPCIONES || opciones.some((o) => !o))
        return setError(`La pregunta ${n} necesita al menos dos opciones y ninguna puede estar vacía.`);
      if (p.correctAnswer < 0 || p.correctAnswer >= opciones.length)
        return setError(`Marca la respuesta correcta de la pregunta ${n}.`);
      if (!Number.isInteger(puntos) || puntos < 1)
        return setError(`Los puntos de la pregunta ${n} deben ser un número entero de 1 o más.`);

      questions.push({
        ...(p._id && { _id: p._id }),
        question: p.question.trim(),
        options: opciones,
        correctAnswer: p.correctAnswer,
        points: puntos,
      });
    }

    setGuardando(true);
    setError("");
    try {
      await onGuardar({
        title,
        description: form.description.trim(),
        maxAttempts,
        published: form.published,
        questions,
      });
    } catch (err) {
      setError(err.message || "No se pudo guardar el quiz. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-6" noValidate>
      {/* Datos generales */}
      <section className={`${ui.bloque} ${ui.form}`}>
        <div className={ui.bloqueCabecera}>
          <h2>Datos del quiz</h2>
        </div>

        <label>
          Título
          <input name="title" value={form.title} onChange={cambiar} placeholder="Ej. Evaluación final" autoFocus />
        </label>

        <label>
          Descripción (opcional)
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={cambiar}
            placeholder="Instrucciones o qué cubre el quiz."
          />
        </label>

        <label>
          Intentos permitidos
          <input
            name="maxAttempts"
            type="number"
            min={1}
            step={1}
            value={form.maxAttempts}
            onChange={cambiar}
            className={`max-w-35`}
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="mt-1 size-4 accent-acento"
          />
          <span>
            <strong className="block">Publicado</strong>
            <span className="text-[.88rem] font-normal text-tinta-suave">
              Si está publicado, los estudiantes inscritos pueden tomarlo. Déjalo sin publicar mientras lo preparas.
            </span>
          </span>
        </label>
      </section>

      {/* Preguntas */}
      <section className={ui.bloque}>
        <div className={ui.bloqueCabecera}>
          <h2>Preguntas</h2>
          <span className="text-[.85rem] text-tinta-suave">
            {preguntas.length} {preguntas.length === 1 ? "pregunta" : "preguntas"} · {totalPuntos}{" "}
            {totalPuntos === 1 ? "punto" : "puntos"}
          </span>
        </div>

        <ol className="m-0 mb-4 flex list-none flex-col gap-4 p-0">
          {preguntas.map((p, i) => (
            <Pregunta
              key={p.clave}
              numero={i + 1}
              pregunta={p}
              esPrimera={i === 0}
              esUltima={i === preguntas.length - 1}
              puedeQuitar={preguntas.length > 1}
              onCambiar={(cambios) => actualizarPregunta(p.clave, cambios)}
              onQuitar={() => quitarPregunta(p.clave)}
              onMover={(delta) => mover(i, delta)}
            />
          ))}
        </ol>

        <button
          type="button"
          className={ui.btnGhost}
          onClick={() => setPreguntas((ps) => [...ps, preguntaVacia()])}
        >
          + Agregar pregunta
        </button>
      </section>

      {error && (
        <p className={ui.errorCaja} role="alert">
          {error}
        </p>
      )}

      <div className={ui.acciones}>
        <button type="submit" className={ui.btn} disabled={guardando}>
          {guardando ? "Guardando…" : quiz?._id ? "Guardar cambios" : "Crear quiz"}
        </button>
      </div>

      {quiz?._id && onEliminar && <ZonaEliminar onEliminar={onEliminar} />}
    </form>
  );
}

/* ---------- Una pregunta ---------- */
function Pregunta({ numero, pregunta, esPrimera, esUltima, puedeQuitar, onCambiar, onQuitar, onMover }) {
  const { question, options, correctAnswer, points } = pregunta;
  const grupo = `correcta-${pregunta.clave}`;

  const cambiarOpcion = (i, valor) => onCambiar({ options: options.map((o, j) => (j === i ? valor : o)) });

  const agregarOpcion = () => onCambiar({ options: [...options, ""] });

  const quitarOpcion = (i) => {
    // Si se quita la correcta, vuelve a la primera; si se quita una anterior a ella, se corre una posición
    const nuevaCorrecta = i === correctAnswer ? 0 : i < correctAnswer ? correctAnswer - 1 : correctAnswer;
    onCambiar({ options: options.filter((_, j) => j !== i), correctAnswer: nuevaCorrecta });
  };

  return (
    <li className="rounded-[3px] border-[1.5px] border-linea p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="text-[.82rem] font-semibold uppercase tracking-wide text-acento">Pregunta {numero}</span>
        <span className="flex-1" />
        <button type="button" className={ui.link} onClick={() => onMover(-1)} disabled={esPrimera} aria-label="Subir pregunta">
          ↑
        </button>
        <button type="button" className={ui.link} onClick={() => onMover(1)} disabled={esUltima} aria-label="Bajar pregunta">
          ↓
        </button>
        {puedeQuitar && (
          <button type="button" className={ui.linkPeligro} onClick={onQuitar}>
            Quitar
          </button>
        )}
      </div>

      <div className={ui.form}>
        <label>
          Enunciado
          <textarea
            rows={2}
            value={question}
            onChange={(e) => onCambiar({ question: e.target.value })}
            placeholder="Escribe la pregunta"
          />
        </label>
      </div>

      <fieldset className="m-0 mb-4 min-w-0 border-0 p-0">
        <legend className="mb-2 p-0 text-[.88rem] font-semibold">
          Opciones <span className="font-normal text-tinta-suave">(marca la correcta)</span>
        </legend>

        <div className="flex flex-col gap-2">
          {options.map((opcion, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={grupo}
                checked={correctAnswer === i}
                onChange={() => onCambiar({ correctAnswer: i })}
                className="size-4 shrink-0 accent-acento"
                aria-label={`Marcar la opción ${i + 1} como correcta`}
              />
              <input
                value={opcion}
                onChange={(e) => cambiarOpcion(i, e.target.value)}
                placeholder={`Opción ${i + 1}`}
                aria-label={`Texto de la opción ${i + 1}`}
                className={`${ui.input} min-w-0 flex-1`}
              />
              {options.length > MIN_OPCIONES && (
                <button
                  type="button"
                  className={ui.linkPeligro}
                  onClick={() => quitarOpcion(i)}
                  aria-label={`Quitar la opción ${i + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {options.length < MAX_OPCIONES && (
          <button type="button" className={`${ui.link} mt-2`} onClick={agregarOpcion}>
            + Agregar opción
          </button>
        )}
      </fieldset>

      <label className="flex items-center gap-2 text-[.88rem] font-semibold">
        Puntos
        <input
          type="number"
          min={1}
          step={1}
          value={points}
          onChange={(e) => onCambiar({ points: e.target.value })}
          className={`${ui.input} w-20`}
        />
      </label>
    </li>
  );
}

/* ---------- Eliminación con confirmación ---------- */
function ZonaEliminar({ onEliminar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  const eliminar = async () => {
    setEliminando(true);
    setError("");
    try {
      await onEliminar();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el quiz. Inténtalo de nuevo.");
      setEliminando(false);
    }
    // Si sale bien, el padre navega a otra pantalla
  };

  return (
    <section className={`${ui.bloque} ${ui.bloquePeligro}`}>
      <div className={ui.bloqueCabecera}>
        <h2>Eliminar quiz</h2>
      </div>

      {!confirmando ? (
        <>
          <p className={`${ui.vacio} mb-3 text-left`}>Se borrará el quiz de forma permanente.</p>
          <button type="button" className={ui.btnPeligro} onClick={() => setConfirmando(true)}>
            Eliminar quiz
          </button>
        </>
      ) : (
        <div role="alert">
          <p className="mb-3 mt-0">¿Seguro que quieres eliminar este quiz? No se puede deshacer.</p>
          {error && <p className={`${ui.error} mb-3`}>{error}</p>}
          <div className={ui.acciones}>
            <button type="button" className={ui.btnPeligro} onClick={eliminar} disabled={eliminando}>
              {eliminando ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button
              type="button"
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

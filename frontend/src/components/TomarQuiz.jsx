import { useState } from "react";
import { ui, BarraApp } from "./Stat"; // ajusta la ruta a tu archivo Stat.jsx

/*
  Pantalla del estudiante para tomar el quiz final de un curso.
  No llama a la API: todo entra por props.

  Props:
    quiz       -> { _id, title, description, maxAttempts,
                    questions: [{ _id, question, options: [string], points }] }
                  IMPORTANTE: el backend NO debe enviar `correctAnswer` al estudiante (se vería en la
                  pestaña Network). La corrección la hace el servidor al recibir las respuestas.
    intentos   -> [{ attemptNumber, score, totalPoints, percentage, submittedAt }]
                  Intentos que este estudiante ya hizo en este quiz.
    cargando   -> boolean
    error      -> string. Error al cargar; si tiene valor, se muestra en lugar del quiz
    onEnviar   -> async (respuestas) => intento
                  respuestas = [{ questionId, selectedAnswer }] (selectedAnswer es la posición de la opción).
                  Debe lanzar un error si falla (el mensaje se muestra en pantalla) y devolver el intento
                  corregido: { attemptNumber, score, totalPoints, percentage,
                               answers: [{ questionId, selectedAnswer, isCorrect, pointsEarned }] }.
                  Después de enviar, el padre debe añadir ese intento a `intentos`.
    onVolver   -> () => void. "← Volver al curso"
*/
export default function TomarQuiz({ quiz, intentos = [], cargando = false, error = "", onEnviar, onVolver }) {
  const [fase, setFase] = useState("intro"); // "intro" | "tomando" | "resultado"
  const [respuestas, setRespuestas] = useState({}); // { [questionId]: indiceOpcion }
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState("");

  const preguntas = quiz?.questions ?? [];
  const maximo = quiz?.maxAttempts ?? 1;
  // Robusto aunque el padre tarde en actualizar `intentos` tras enviar
  const usados = Math.max(intentos.length, resultado?.attemptNumber ?? 0);
  const restantes = Math.max(0, maximo - usados);
  const mejor = intentos.reduce((m, i) => Math.max(m, i.percentage ?? 0), resultado?.percentage ?? 0);
  const contestadas = preguntas.filter((p) => respuestas[p._id] !== undefined).length;
  const completo = preguntas.length > 0 && contestadas === preguntas.length;
  const totalPuntos = preguntas.reduce((s, p) => s + (p.points ?? 1), 0);

  const empezar = () => {
    setRespuestas({});
    setResultado(null);
    setFallo("");
    setFase("tomando");
    window.scrollTo?.({ top: 0 });
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!completo) {
      setFallo("Responde todas las preguntas antes de enviar.");
      return;
    }
    setEnviando(true);
    setFallo("");
    try {
      const intento = await onEnviar?.(
        preguntas.map((p) => ({ questionId: p._id, selectedAnswer: respuestas[p._id] }))
      );
      setResultado(intento);
      setFase("resultado");
      window.scrollTo?.({ top: 0 });
    } catch (err) {
      setFallo(err.message || "No se pudo enviar el quiz. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={ui.pagina}>
      <BarraApp />

      <main className={ui.contenedorEstrecho}>
        <button className={`${ui.link} mb-4`} onClick={onVolver} disabled={enviando}>
          ← Volver al curso
        </button>

        {cargando ? (
          <div className="py-10 text-center text-tinta-suave">
            <div className={ui.spinner} />
            Cargando quiz…
          </div>
        ) : error ? (
          <p className={ui.errorCaja}>{error}</p>
        ) : !quiz ? (
          <div className={ui.vacioCaja}>
            <p className={ui.vacio}>No encontramos este quiz.</p>
          </div>
        ) : fase === "intro" ? (
          <section className={ui.bloque}>
            <p className="m-0 mb-1 text-[.82rem] font-semibold uppercase tracking-wide text-acento">
              Evaluación final
            </p>
            <h1 className={ui.titulo}>{quiz.title}</h1>
            {quiz.description && (
              <p className="mb-4 mt-2 whitespace-pre-line leading-relaxed">{quiz.description}</p>
            )}

            <ul className="mb-5 mt-4 flex list-none flex-wrap gap-x-6 gap-y-1 p-0 text-[.93rem] text-tinta-suave">
              <li>{preguntas.length} {preguntas.length === 1 ? "pregunta" : "preguntas"}</li>
              <li>{totalPuntos} {totalPuntos === 1 ? "punto" : "puntos"} en total</li>
              <li>
                {usados} de {maximo} {maximo === 1 ? "intento usado" : "intentos usados"}
              </li>
            </ul>

            {intentos.length > 0 && <HistorialIntentos intentos={intentos} mejor={mejor} />}

            {restantes > 0 ? (
              <button className={ui.btn} onClick={empezar} disabled={preguntas.length === 0}>
                {usados === 0 ? "Empezar quiz" : `Intentar de nuevo (${restantes} ${restantes === 1 ? "restante" : "restantes"})`}
              </button>
            ) : (
              <p className={ui.aviso}>Ya usaste todos tus intentos en este quiz.</p>
            )}
          </section>
        ) : fase === "tomando" ? (
          <form onSubmit={enviar} noValidate>
            <header className="mb-5">
              <h1 className={ui.titulo}>{quiz.title}</h1>
              <p className={ui.subtitulo}>
                Intento {usados + 1} de {maximo}. Elige una respuesta en cada pregunta.
              </p>
            </header>

            <ol className="m-0 flex list-none flex-col gap-5 p-0">
              {preguntas.map((p, i) => (
                <li key={p._id}>
                  <fieldset className={`${ui.bloque} m-0 min-w-0`}>
                    <legend className="sr-only">Pregunta {i + 1}</legend>
                    <p className="m-0 mb-1 text-[.82rem] font-semibold uppercase tracking-wide text-acento">
                      Pregunta {i + 1} · {p.points ?? 1} {(p.points ?? 1) === 1 ? "punto" : "puntos"}
                    </p>
                    <p className="m-0 mb-3 text-[1.05rem] font-semibold leading-snug">{p.question}</p>

                    <div className="flex flex-col gap-2">
                      {p.options.map((opcion, j) => {
                        const elegida = respuestas[p._id] === j;
                        return (
                          <label
                            key={j}
                            className={`flex cursor-pointer items-center gap-3 rounded-[3px] border-[1.5px] px-3 py-2.5 transition-colors ${
                              elegida ? "border-acento bg-acento-suave font-semibold" : "border-linea hover:bg-acento-suave"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`pregunta-${p._id}`}
                              checked={elegida}
                              onChange={() => {
                                setRespuestas({ ...respuestas, [p._id]: j });
                                setFallo("");
                              }}
                              className="size-4 shrink-0 accent-acento"
                            />
                            <span className="min-w-0 flex-1">{opcion}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </li>
              ))}
            </ol>

            {fallo && (
              <p className={`${ui.errorCaja} mt-5`} role="alert">
                {fallo}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="submit" className={ui.btn} disabled={enviando}>
                {enviando ? "Enviando…" : "Enviar respuestas"}
              </button>
              <button type="button" className={ui.btnGhost} onClick={() => setFase("intro")} disabled={enviando}>
                Cancelar
              </button>
              <span className="text-[.9rem] tabular-nums text-tinta-suave">
                {contestadas}/{preguntas.length} respondidas
              </span>
            </div>
          </form>
        ) : (
          <Resultado
            quiz={quiz}
            preguntas={preguntas}
            resultado={resultado}
            restantes={restantes}
            onReintentar={empezar}
            onVolver={onVolver}
          />
        )}
      </main>
    </div>
  );
}

/* ---------- Historial de intentos ---------- */
function HistorialIntentos({ intentos, mejor }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-display text-[1.05rem] font-semibold">Tus intentos</h2>
        <span className="text-[.88rem] text-tinta-suave">Mejor resultado: {Math.round(mejor)}%</span>
      </div>
      <ul className="m-0 list-none p-0">
        {[...intentos]
          .sort((a, b) => a.attemptNumber - b.attemptNumber)
          .map((i) => (
            <li
              key={i.attemptNumber}
              className="flex flex-wrap items-center gap-3 border-t-[1.5px] border-linea py-2 first:border-t-0"
            >
              <span className="min-w-22.5 font-semibold">Intento {i.attemptNumber}</span>
              <span className="flex-1 text-[.9rem] text-tinta-suave">
                {i.score}/{i.totalPoints} puntos
                {i.submittedAt && ` · ${formatearFecha(i.submittedAt)}`}
              </span>
              <span className="font-semibold tabular-nums">{Math.round(i.percentage)}%</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

/* ---------- Resultado del intento ---------- */
function Resultado({ quiz, preguntas, resultado, restantes, onReintentar, onVolver }) {
  if (!resultado) return null;
  const porId = new Map((resultado.answers ?? []).map((a) => [String(a.questionId), a]));
  const correctas = (resultado.answers ?? []).filter((a) => a.isCorrect).length;

  return (
    <>
      <section className={`${ui.bloque} mb-6 text-center`}>
        <p className="m-0 text-[.82rem] font-semibold uppercase tracking-wide text-acento">
          Intento {resultado.attemptNumber} · {quiz.title}
        </p>
        <p className="my-2 font-display text-[3.2rem] font-semibold leading-none tracking-tight">
          {Math.round(resultado.percentage)}%
        </p>
        <p className="m-0 text-tinta-suave">
          {resultado.score} de {resultado.totalPoints} puntos · {correctas} de {preguntas.length} correctas
        </p>

        <div className={`${ui.acciones} mt-5 justify-center`}>
          {restantes > 0 && (
            <button className={ui.btn} onClick={onReintentar}>
              Intentar de nuevo ({restantes} {restantes === 1 ? "restante" : "restantes"})
            </button>
          )}
          <button className={restantes > 0 ? ui.btnGhost : ui.btn} onClick={onVolver}>
            Volver al curso
          </button>
        </div>
        {restantes === 0 && <p className="mb-0 mt-3 text-[.88rem] text-tinta-suave">Usaste todos tus intentos.</p>}
      </section>

      <section className={ui.bloque}>
        <div className={ui.bloqueCabecera}>
          <h2>Revisión</h2>
        </div>

        <ol className="m-0 list-none p-0">
          {preguntas.map((p, i) => {
            const r = porId.get(String(p._id));
            return (
              <li key={p._id} className="border-t-[1.5px] border-linea py-3.5 first:border-t-0 first:pt-0">
                <div className="flex items-start gap-3">
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-[.8rem] font-bold ${
                      r?.isCorrect ? "bg-acento text-hoja" : "bg-peligro text-hoja"
                    }`}
                    aria-hidden="true"
                  >
                    {r?.isCorrect ? "✓" : "✕"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-semibold leading-snug">
                      {i + 1}. {p.question}
                    </p>
                    <p className="m-0 mt-1 text-[.9rem] text-tinta-suave">
                      Tu respuesta: {r ? (p.options[r.selectedAnswer] ?? "—") : "—"}
                    </p>
                    <p className="m-0 mt-0.5 text-[.85rem] font-semibold">
                      <span className="sr-only">{r?.isCorrect ? "Correcta. " : "Incorrecta. "}</span>
                      {r?.pointsEarned ?? 0}/{p.points ?? 1} {(p.points ?? 1) === 1 ? "punto" : "puntos"}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}

const formatearFecha = (f) =>
  new Date(f).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" });

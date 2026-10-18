import { useState } from "react";
import PortadaInput from "./PortadaInput";
import { BarraApp, ui } from "./Stat";
/*
  Props:
    onCrear      -> async ({ title, description, cover }) => void. Debe lanzar un error si falla
                    (el mensaje del error se muestra en el formulario).
                    cover es un File o null si no eligió portada.
    onCancelar   -> () => void. Se ejecuta al pulsar "Cancelar" (por ejemplo, volver al dashboard).
*/
export default function CrearCursoForm({ onCrear, onCancelar }) {
  const [form, setForm] = useState({ title: "", description: "" });
  const [cover, setCover] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      setError("Escribe un título y una descripción para el curso.");
      return;
    }

    setGuardando(true);
    setError("");
    try {
      await onCrear({ title, description, image: cover });
    } catch (err) {
      setError(err.message || "No se pudo crear el curso. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className={`${ui.pagina} ${ui.profesor}`}>
      <BarraApp>
        <button className={ui.btnTexto} onClick={onCancelar}>
          ← Mi perfil
        </button>
      </BarraApp>

      <div className={ui.contenedorEstrecho}>
        <header className="mb-6">
          <div>
            <p className={ui.etiqueta}>Nuevo curso</p>
            <h1 className={ui.titulo}>Crear curso</h1>
            <p className={ui.subtitulo}>Completa los datos básicos. Podrás editarlos después.</p>
          </div>
        </header>

        <form className={`${ui.bloque} ${ui.form}`} onSubmit={enviar}>
          <label>
            Título
            <input
              name="title"
              value={form.title}
              onChange={cambiar}
              placeholder="Ej. Matemática I"
              autoFocus
            />
          </label>

          <label>
            Descripción
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={cambiar}
              placeholder="¿De qué trata el curso y qué aprenderán los estudiantes?"
            />
          </label>

          <PortadaInput archivo={cover} onChange={setCover} />

          {error && <p className={ui.error}>{error}</p>}

          <div className={ui.acciones}>
            <button type="submit" className={ui.btn} disabled={guardando}>
              {guardando ? "Creando…" : "Crear curso"}
            </button>
            <button type="button" className={ui.btnGhost} onClick={onCancelar} disabled={guardando}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
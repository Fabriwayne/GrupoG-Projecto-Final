import { useRef, useState } from "react";
import { ui } from "./Stat"; // ajusta la ruta a tu archivo Stat.jsx

// Debe coincidir con lo que acepta el backend (middlewares/uploadMiddleware.js)
const EXTENSIONES = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "zip", "png", "jpg", "jpeg"];
const MAX_MB = 10;

/*
  Selector de un archivo adjunto (material de la lección).

  Props:
    archivo        -> File | null. El archivo elegido por el usuario (estado que guarda el formulario).
    nombreActual   -> string. Nombre del archivo que ya tiene la lección (al editar). Se muestra si no hay archivo nuevo.
    urlActual      -> string. URL del archivo que ya tiene la lección (al editar). Opcional, solo para enlazarlo.
    onChange       -> (file | null) => void. Se llama al elegir un archivo válido o al descartar la selección.
*/
export default function ArchivoInput({ archivo, nombreActual = "", urlActual = "", onChange }) {
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const elegir = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!EXTENSIONES.includes(ext)) {
      setError(`Formato no permitido. Usa: ${EXTENSIONES.join(", ")}.`);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo pesa demasiado. El máximo es ${MAX_MB} MB.`);
      e.target.value = "";
      return;
    }

    setError("");
    onChange(file);
  };

  const descartar = () => {
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  };

  const hayActual = !archivo && nombreActual;

  return (
    <div className="mb-4 flex flex-col gap-2">
      <span className="text-[.88rem] font-semibold">Archivo adjunto (opcional)</span>

      <div className="flex flex-wrap items-center gap-3 rounded-[3px] border-[1.5px] border-dashed border-linea bg-acento-suave px-3 py-2.5 text-[.92rem]">
        <span aria-hidden="true">📎</span>
        {archivo ? (
          <span className="min-w-0 flex-1 truncate">
            {archivo.name} <span className="text-tinta-suave">({formatearTamano(archivo.size)})</span>
          </span>
        ) : hayActual ? (
          <span className="min-w-0 flex-1 truncate">
            {urlActual ? (
              <a href={urlActual} target="_blank" rel="noopener noreferrer" className={ui.link}>
                {nombreActual}
              </a>
            ) : (
              nombreActual
            )}
            <span className="text-tinta-suave"> (actual)</span>
          </span>
        ) : (
          <span className="flex-1 text-tinta-suave">Ningún archivo seleccionado</span>
        )}
      </div>

      <div className={ui.acciones}>
        <button type="button" className={ui.btnGhost} onClick={() => inputRef.current?.click()}>
          {archivo || hayActual ? "Cambiar archivo" : "Elegir archivo"}
        </button>
        {archivo && (
          <button type="button" className={ui.btnGhost} onClick={descartar}>
            Descartar
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={EXTENSIONES.map((e) => `.${e}`).join(",")}
        onChange={elegir}
        hidden
      />

      <p className="m-0 text-[.82rem] text-tinta-suave">
        {EXTENSIONES.slice(0, 6).join(", ")}… hasta {MAX_MB} MB.
      </p>
      {error && (
        <p className={ui.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const formatearTamano = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

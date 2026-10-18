import { useEffect, useMemo, useRef, useState } from "react";
import "./Perfil.css";
import { ui } from "./Stat";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

/*
  Selector de portada con vista previa.

  Props:
    archivo    -> File | null. El archivo elegido por el usuario (estado que guarda el formulario).
    urlActual  -> string. Portada que ya tiene el curso (al editar). Se muestra si no hay archivo nuevo.
    onChange   -> (file | null) => void. Se llama al elegir una imagen válida o al quitar la selección.
*/
export default function PortadaInput({ archivo, urlActual = "", onChange }) {
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Vista previa local del archivo elegido; se libera la URL temporal al cambiar o desmontar
  const preview = useMemo(() => (archivo ? URL.createObjectURL(archivo) : ""), [archivo]);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const elegir = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setError("Usa una imagen JPG, PNG o WebP.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen pesa demasiado. El máximo es ${MAX_MB} MB.`);
      e.target.value = "";
      return;
    }

    setError("");
    onChange(file);
  };

  const quitarSeleccion = () => {
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  };

  const imagen = preview || urlActual;

  return (
    <div className="mb-4 flex flex-col gap-2.5">
      <span className="text-[.88rem] font-semibold">Portada (opcional)</span>

      <div className="grid aspect-video w-full max-w-[440px] place-items-center overflow-hidden rounded-[3px] border-[1.5px] border-dashed border-linea bg-hoja-2 text-[.9rem] text-tinta-suave [&_img]:block [&_img]:size-full [&_img]:object-cover">
        {imagen ? (
          <img src={imagen} alt="Vista previa de la portada" />
        ) : (
          <span>Sin portada</span>
        )}
      </div>

      <div className={ui.acciones}>
        <button type="button" className={ui.btnGhost} onClick={() => inputRef.current?.click()}>
          {imagen ? "Cambiar imagen" : "Elegir imagen"}
        </button>
        {archivo && (
          <button type="button" className={ui.btnGhost} onClick={quitarSeleccion}>
            Descartar cambio
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_PERMITIDOS.join(",")}
        onChange={elegir}
        hidden
      />

      <p className="m-0 text-[.82rem] text-tinta-suave">JPG, PNG o WebP, hasta {MAX_MB} MB.</p>
      {error && <p className={ui.error} role="alert">{error}</p>}
    </div>
  );
}
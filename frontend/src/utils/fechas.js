export function saludoSegunHora(fecha = new Date()) {
    const hora = fecha.getHours();
    if (hora < 6) return "Buenas noches";
    if (hora < 12 ) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
}

export function fechaLarga(fecha = new Date()) {
    return fecha.toLocaleDateString("es-DO", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

const relativo = new Intl.RelativeTimeFormat("es", { numeric: "auto"})

export function haceCuanto(fecha, ahora = new Date()) {
    const dias = Math.trunc((new Date(fecha) - ahora) / 86400000) || 0;
    if (Math.abs(dias) < 30) return relativo.format(dias, "day");
    return relativo.format(Math.trunc(dias / 30), "month");
}
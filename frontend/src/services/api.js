// Dirección del backend: viene de frontend/.env (VITE_API_URL) o usa localhost:5000
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function request(path, options = {}) {
    const esFormData = options.body instanceof FormData;

    const response = await fetch(`${API_URL}${path}`, {
        credentials: "include",
        ...options,
        headers: {
            ...(!esFormData && options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error = new Error(data?.message || "Ocurrió un error en el servidor");
        error.status = response.status;
        throw error;
    }

    return data;
}
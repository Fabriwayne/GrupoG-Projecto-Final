
const API_URL = "http://localhost:5000/api/auth";

const registerUser = async (usuario) => {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    });

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "Error al registrarse");
    }

    return data;
}

const loginUser = async (datos) => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(datos)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
    }

    return data;
};

const logoutUser = async () => {
    const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Error al cerrar sesión");
    }

    return data;
};

export{
    registerUser,
    loginUser,
    logoutUser
}
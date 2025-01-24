import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("joinSessionForm");
    const submitButton = document.querySelector(".btn-submit");
    const errorElement = document.getElementById("error");
    const loadingSpinner = document.getElementById("loadingSpinner");

    // Limpia la URL para evitar cadenas de consulta
    const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const sessionCode = document.getElementById("sessionCode").value.trim();
        const username = document.getElementById("username").value.trim();

        // Validar inputs
        if (!sessionCode || !username) {
            errorElement.textContent = "El código de sesión y el nombre de usuario son obligatorios.";
            return;
        }

        try {
            // Mostrar el spinner y deshabilitar el botón
            loadingSpinner.style.display = "flex";
            submitButton.disabled = true;
            errorElement.textContent = "";

            // Llamada a la función para unirse a la sesión
            const sessionData = await joinSession(sessionCode, username);

            // Guardar el token de sesión y el nombre de usuario en sessionStorage
            sessionStorage.setItem("sessionToken", sessionData.sessionToken);
            sessionStorage.setItem("username", username);

            // Redirigir a sesion_menu.html con los parámetros necesarios
            window.location.href = `sesion_menu.html?sessionCode=${sessionCode}&username=${username}`;

        } catch (error) {
            errorElement.textContent = error.message;
        } finally {
            // Ocultar el spinner y habilitar el botón
            loadingSpinner.style.display = "none";
            submitButton.disabled = false;
        }
    });

    async function joinSession(sessionCode, username) {
        const response = await fetch(`${API_BASE_URL}/api/game-sessions/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sessionCode, username })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        return response.json();
    }
});
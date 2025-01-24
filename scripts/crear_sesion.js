import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("sessionForm");
    const submitButton = form.querySelector("button[type='submit']");
    const errorElement = document.getElementById("error");
    const loadingSpinner = document.getElementById("loadingSpinner");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = form.username.value.trim();

        if (!username) {
            errorElement.textContent = "El nombre de usuario es obligatorio.";
            return;
        }

        try {
            // Mostrar el spinner y deshabilitar el botón
            loadingSpinner.style.display = "flex"; // Asegúrate de que el CSS lo centre
            submitButton.disabled = true;
            errorElement.textContent = "";

            // Llamada a la función para crear la sesión
            const sessionData = await createSession(username);

            // Guardar el token de sesión y el nombre de usuario en sessionStorage
            sessionStorage.setItem("sessionToken", sessionData.sessionToken);
            sessionStorage.setItem("username", username);

            // Redirigir a sesion_menu.html con los parámetros necesarios
            window.location.href = `sesion_menu.html?sessionCode=${sessionData.sessionCode}&username=${username}`;

        } catch (error) {
            errorElement.textContent = error.message;
        } finally {
            // Ocultar el spinner y habilitar el botón
            loadingSpinner.style.display = "none";
            submitButton.disabled = false;
        }
    });

    async function createSession(username) {
        const response = await fetch(`${API_BASE_URL}/api/game-sessions/create?username=${username}`, { method: "POST" });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        return response.json();
    }
});
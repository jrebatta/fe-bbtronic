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

            // Simular múltiples operaciones de carga
            const responses = await Promise.all([
                fetch(`${API_BASE_URL}/api/game-sessions/create?username=${username}`, { method: "POST" }),
                // Aquí puedes agregar otras llamadas a API o promesas necesarias
                new Promise(resolve => setTimeout(resolve, 1000)) // Ejemplo: simula una espera
            ]);

            const [sessionResponse] = responses;

            if (!sessionResponse.ok) {
                const errorData = await sessionResponse.json();
                throw new Error(errorData.error);
            }

            const data = await sessionResponse.json();
            sessionStorage.setItem("sessionToken", data.sessionToken);
            sessionStorage.setItem("username", data.username);

            // Redirigir después de la carga completa
            window.location.href = `sesion_menu.html?sessionCode=${data.sessionCode}&username=${username}`;
        } catch (error) {
            errorElement.textContent = error.message;
            console.error("Error:", error.message);
        } finally {
            // Ocultar el spinner y habilitar el botón
            loadingSpinner.style.display = "none";
            submitButton.disabled = false;
        }
    });
});

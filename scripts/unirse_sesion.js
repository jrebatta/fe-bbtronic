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
            errorElement.textContent = "Por favor, completa todos los campos.";
            return;
        }

        try {
            // Mostrar spinner y deshabilitar botón
            loadingSpinner.style.display = "flex";
            submitButton.disabled = true;
            errorElement.textContent = "";

            const response = await fetch(`${API_BASE_URL}/api/game-sessions/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ sessionCode, username })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al unirse a la sesión.");
            }

            const data = await response.json();
            sessionStorage.setItem("sessionToken", data.sessionToken);
            sessionStorage.setItem("username", username);

            // Redirigir al menú de sesión
            window.location.href = `sesion_menu.html?sessionCode=${sessionCode}&username=${username}`;
        } catch (error) {
            errorElement.textContent = error.message;
            console.error("Error:", error.message);
        } finally {
            // Ocultar spinner y habilitar botón
            loadingSpinner.style.display = "none";
            submitButton.disabled = false;
        }
    });
});

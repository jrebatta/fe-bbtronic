import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("joinSessionForm");
    const submitButton = document.querySelector(".btn-submit");
    const errorElement = document.getElementById("error");

    // Eliminar la cadena de consulta de la URL
    const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const sessionCode = document.getElementById("sessionCode").value;
        const username = document.getElementById("username").value;

        // Deshabilitar el botón
        submitButton.disabled = true;

        try {
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

            const data = await response.json();
            sessionStorage.setItem("sessionToken", data.sessionToken);
            sessionStorage.setItem("username", username);

            window.location.href = `sesion_menu.html?sessionCode=${sessionCode}&username=${username}`;
        } catch (error) {
            errorElement.textContent = error.message;
            console.error("Error:", error.message);
        } finally {
            submitButton.disabled = false;
        }
    });
});

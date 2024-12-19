import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("sessionForm");
    const submitButton = form.querySelector("button[type='submit']");
    const errorElement = document.getElementById("error");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = form.username.value.trim();

        if (!username) {
            errorElement.textContent = "El nombre de usuario es obligatorio.";
            return;
        }

        try {
            submitButton.disabled = true;
            errorElement.textContent = "";

            const response = await fetch(`${API_BASE_URL}/api/game-sessions/create?username=${username}`, { method: "POST" });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            const data = await response.json();
            sessionStorage.setItem("sessionToken", data.sessionToken);
            sessionStorage.setItem("username", data.username);

            window.location.href = `sesion_menu.html?sessionCode=${data.sessionCode}&username=${username}`;
        } catch (error) {
            errorElement.textContent = error.message;
            console.error("Error:", error.message);
        } finally {
            submitButton.disabled = false;
        }
    });
});

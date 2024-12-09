import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("sessionForm");
    const submitButton = document.querySelector("#sessionForm button[type='submit']");
    const errorElement = document.getElementById("error");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const username = document.getElementById("username").value;

        // Deshabilitar el botón al inicio
        submitButton.disabled = true;

        fetch(`${API_BASE_URL}/api/game-sessions/create?username=${username}`, {
            method: "POST"
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error);
                    });
                }
                return response.json();
            })
            .then(data => {
                sessionStorage.setItem("sessionToken", data.sessionToken);
                sessionStorage.setItem("username", data.username);                
                const sessionCode = data.sessionCode;
                window.location.href = `sesion_menu.html?sessionCode=${sessionCode}&username=${username}`;
            })
            .catch(error => {
                // Habilitar el botón nuevamente en caso de error
                submitButton.disabled = false;
                // Muestra el mensaje de error específico del backend
                errorElement.textContent = error.message;
                console.error("Error:", error.message);
            });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("joinSessionForm");
    const submitButton = document.querySelector("#joinSessionForm button[type='submit']");
    const errorElement = document.getElementById("error");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const sessionCode = document.getElementById("sessionCode").value;
        const username = document.getElementById("username").value;

        // Deshabilitar el botón al inicio
        submitButton.disabled = true;

        fetch(`http://localhost:8080/api/game-sessions/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sessionCode, username })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error);
                    });
                }
                return response.json(); // Asegúrate de que haya un cuerpo JSON en la respuesta
            })
            .then(data => {
                // Guardar el token de sesión en localStorage y redirigir
                localStorage.setItem("sessionToken", data.sessionToken);
                localStorage.setItem("username", username);
                window.location.href = `sesion_menu.html?sessionCode=${sessionCode}&username=${username}`;
            })
            .catch(error => {
                // Habilitar el botón nuevamente en caso de error
                submitButton.disabled = false;
                // Mostrar el mensaje de error específico del backend
                errorElement.textContent = error.message;
                console.error("Error:", error.message);
            });
    });
});

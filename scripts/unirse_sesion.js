document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("joinSessionForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const sessionCode = document.getElementById("sessionCode").value;
        const username = document.getElementById("username").value;

        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/join`, {
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
            // Muestra el mensaje de error específico del backend
            document.getElementById("error").textContent = error.message;
            console.error("Error:", error.message);
        });
    });
});

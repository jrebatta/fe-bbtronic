document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("sessionForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;

        fetch(`http://192.168.18.18:8080/api/game-sessions/create?username=${username}`, {
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
            // Guarda el token de sesión en localStorage y redirige a sesion_menu.html
            localStorage.setItem("sessionToken", data.sessionToken);
            localStorage.setItem("username", data.username);
            const sessionCode = data.sessionCode;
            window.location.href = `sesion_menu.html?sessionCode=${sessionCode}&username=${username}`;
        })
        .catch(error => {
            // Muestra el mensaje de error específico del backend
            document.getElementById("error").textContent = error.message;
            console.error("Error:", error.message);
        });
    });
});

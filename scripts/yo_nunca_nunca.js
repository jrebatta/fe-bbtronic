import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');

    // Conexión al WebSocket
    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        console.log("WebSocket conectado.");

        // Suscribirse al canal para recibir preguntas
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            try {
                const parsedMessage = JSON.parse(message.body);

                if (parsedMessage.event === "newYoNuncaNuncaQuestion") {
                    const { question, user } = parsedMessage.data;
                    updateUI(question, user);
                }
            } catch (error) {
                console.error("Error al procesar el mensaje del WebSocket:", error);
            }
        });

        fetchSessionDetails(); // Verificar si el usuario es el creador y cargar la primera pregunta
    });

    // Botón para salir de la sesión
    document.getElementById("logoutButton").addEventListener("click", function () {
        const sessionToken = sessionStorage.getItem("sessionToken");
    
        if (!sessionToken) {
            window.location.href = "/index.html";
            return;
        }
    
        // Realizar la llamada al endpoint de logout
        fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, {
            method: "DELETE"
        })
            .then(response => response.text())
            .then(message => {
                console.log(message); // Mostrar el mensaje recibido del backend
                if (message.includes("Sesión cerrada") || message.includes("Usuario no encontrado")) {
                    // Notificar al servidor que el usuario salió
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                        event: "userLeft",
                        username
                    }));
    
                    // Limpiar datos del almacenamiento de sesión
                    sessionStorage.removeItem("sessionToken");
                    sessionStorage.removeItem("username");
    
                    // Redirigir al usuario a la página principal
                    window.location.href = "/index.html";
                } else {
                    alert("Error inesperado al cerrar sesión.");
                }
            })
            .catch(error => console.error("Error cerrando sesión:", error));
    });
    

    // Botón para obtener la siguiente pregunta (Solo visible para el creador)
    document.getElementById("nextQuestionButton").addEventListener("click", fetchNextQuestion);

    // Actualizar la UI con la pregunta
function updateUI(question) {
    document.getElementById("questionText").textContent = question.texto;
}


    // Llamar al endpoint para obtener una pregunta (Solo el creador puede llamar este método)
function fetchNextQuestion() {
    fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/next-yo-nunca-nunca?tipo=1`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener la siguiente pregunta");
            }
            return response.json();
        })
        .then(data => {
            const question = data; // Ahora solo trabajamos con la pregunta
            stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                event: "newYoNuncaNuncaQuestion",
                data: { question } // Solo enviamos la pregunta
            }));
        })
        .catch(error => console.error("Error al obtener la siguiente pregunta:", error));
}


    // Verificar si el usuario es el creador de la sesión
    function fetchSessionDetails() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al obtener detalles de la sesión");
                }
                return response.json();
            })
            .then(data => {
                // Mostrar el botón "Siguiente" solo si el usuario es el creador
                const isCreator = data.creator === username;
                document.getElementById("nextQuestionButton").style.display = isCreator ? "block" : "none";

                // Si es el creador, cargar la primera pregunta
                if (isCreator) {
                    fetchNextQuestion();
                }
            })
            .catch(error => console.error("Error al obtener detalles de la sesión:", error));
    }
});

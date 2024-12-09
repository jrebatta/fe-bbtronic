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
        sessionStorage.removeItem("sessionToken");
        sessionStorage.removeItem("username");
        window.location.href = "/index.html";
    });

    // Botón para obtener la siguiente pregunta (Solo visible para el creador)
    document.getElementById("nextQuestionButton").addEventListener("click", fetchNextQuestion);

    // Actualizar la UI con la pregunta y usuario asignado
    function updateUI(question, user) {
        document.getElementById("questionText").textContent = question.texto;
        document.getElementById("toUser").textContent = user.username;
    }

    // Llamar al endpoint para obtener una pregunta (Solo el creador puede llamar este método)
    function fetchNextQuestion() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/next-yo-nunca-nunca`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al obtener la siguiente pregunta");
                }
                return response.json();
            })
            .then(data => {
                const { question, user } = data; // Desestructurar la pregunta y el usuario
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "newYoNuncaNuncaQuestion",
                    data: { question, user }
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

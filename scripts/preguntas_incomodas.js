import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');

    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        console.log("WebSocket conectado.");

        // Suscribirse al canal de preguntas
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            const parsedMessage = JSON.parse(message.body);

            if (parsedMessage.event === "nextQuestion") {
                const { question, toUser } = parsedMessage;
                updateUI(question, toUser);
            } else if (parsedMessage.event === "returnToLobby") {
                redirectToLobby(parsedMessage.isCreator);
            }
        });

        fetchSessionDetails();
    });

    document.getElementById("logoutButton").addEventListener("click", logoutUser);
    document.getElementById("nextQuestionButton").addEventListener("click", fetchNextQuestion);
    document.getElementById("lobbyButton").addEventListener("click", returnToLobby);

    function updateUI(question, toUser) {
        const questionContainer = document.getElementById("preguntas");
        questionContainer.innerHTML = `
            <label class="to-user-label">Pregunta para ${toUser}:</label>
            <p class="card-text display-5" id="questionText">${question}</p>
        `;
    }

    function fetchNextQuestion() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/next-preguntas-incomodas?tipo=all`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al obtener la siguiente pregunta.");
                }
                return response.json();
            })
            .then(data => {
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "nextQuestion",
                    question: data.question,
                    toUser: data.toUser
                }));
            })
            .catch(error => console.error("Error al obtener la siguiente pregunta:", error));
    }

    function fetchSessionDetails() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al obtener detalles de la sesión.");
                }
                return response.json();
            })
            .then(data => {
                const isCreator = data.creator === username;
                document.getElementById("nextQuestionButton").style.display = isCreator ? "block" : "none";
                document.getElementById("lobbyButton").style.display = isCreator ? "block" : "none";

                if (isCreator) {
                    fetchNextQuestion();
                }
            })
            .catch(error => console.error("Error al obtener detalles de la sesión:", error));
    }

    function returnToLobby() {
        // Enviar evento para redirigir a todos los usuarios
        stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
            event: "returnToLobby",
            isCreator: true
        }));

        // Redirigir al lobby como creador
        redirectToLobby(true);
    }

    function redirectToLobby(isCreator) {
        const url = isCreator
            ? `/pages/sesion_menu.html?sessionCode=${sessionCode}&username=${username}&role=creator`
            : `/pages/sesion_menu.html?sessionCode=${sessionCode}&username=${username}`;
        window.location.href = url;
    }

    function logoutUser() {
        const sessionToken = sessionStorage.getItem("sessionToken");

        fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, {
            method: "DELETE"
        })
            .then(() => {
                sessionStorage.clear();
                window.location.href = "/index.html";
            })
            .catch(error => console.error("Error al cerrar sesión:", error));
    }
});

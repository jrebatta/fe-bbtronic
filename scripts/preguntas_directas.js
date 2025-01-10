import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');

    const questionsContainer = document.getElementById("questionsContainer");
    const submitQuestionsButton = document.getElementById("submitQuestionsButton");
    const anonymousCheck = document.getElementById("anonymousCheck");
    const errorElement = document.getElementById("error");
    const logoutButton = document.getElementById("logoutButton");
    const lobbyButton = document.getElementById("lobbyButton");

    let questionsSent = false;

    // Configuración del WebSocket
    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/${sessionCode}`, (message) => {
            const parsedMessage = JSON.parse(message.body);

            if (parsedMessage.event === "allReady") {
                redirectToPage(`mostrar_preguntas.html`);
            } else if (parsedMessage.event === "returnToLobby") {
                redirectToLobby(parsedMessage.isCreator);
            }
        });

        fetchSessionDetails();
    });

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
                lobbyButton.style.display = isCreator ? "block" : "none";

                if (isCreator) {
                    console.log("Eres el creador de la sesión.");
                }
            })
            .catch(() => displayError("Error al cargar detalles de la sesión."));
    }

    function loadUsers() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => response.json())
            .then(data => {
                data.users
                    .filter(user => user.username !== username)
                    .forEach(user => createQuestionInput(user.username));
            })
            .catch(() => displayError("Error al cargar usuarios."));
    }

    function createQuestionInput(toUser) {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question-item");

        questionDiv.innerHTML = `
            <label>Pregunta para ${toUser}:</label>
            <input type="text" data-to-user="${toUser}" placeholder="Escribe tu pregunta aquí">
        `;

        questionsContainer.appendChild(questionDiv);
    }

    submitQuestionsButton.addEventListener("click", () => {
        if (questionsSent) return;
        questionsSent = true;

        const inputs = questionsContainer.querySelectorAll("input");
        if ([...inputs].some(input => !input.value.trim())) {
            questionsSent = false;
            return displayError("Por favor, completa todas las preguntas.");
        }

        inputs.forEach(input => sendQuestion(input));
        markUserReady();
    });

    function sendQuestion(input) {
        const payload = {
            fromUser: username,
            toUser: input.dataset.toUser,
            question: input.value.trim(),
            anonymous: anonymousCheck.checked
        };

        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/send-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(() => displayError("Error al enviar pregunta."));
    }

    function markUserReady() {
        fetch(`${API_BASE_URL}/api/users/${username}/ready`, { method: "POST" })
            .then(() => checkAllReady())
            .catch(() => displayError("Error al marcar usuario como listo."));
    }

    function checkAllReady() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/check-all-ready`)
            .then(response => response.json())
            .then(data => {
                if (data.allReady) {
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "allReady" }));
                } else {
                    displayError(data.message || "Aún faltan usuarios por estar listos.");
                }
            })
            .catch(() => displayError("Error al verificar usuarios listos."));
    }

    lobbyButton.addEventListener("click", returnToLobby);

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

    logoutButton.addEventListener("click", () => {
        const sessionToken = sessionStorage.getItem("sessionToken");
        fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, { method: "DELETE" })
            .then(() => {
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "userLeft", username }));
                clearSessionAndRedirect();
            })
            .catch(() => displayError("Error al cerrar sesión."));
    });

    function displayError(message) {
        errorElement.textContent = message;
    }

    function clearSessionAndRedirect() {
        sessionStorage.clear();
        redirectToPage("/index.html");
    }

    function redirectToPage(page) {
        window.location.href = `${page}?sessionCode=${sessionCode}&username=${username}`;
    }

    loadUsers();
});

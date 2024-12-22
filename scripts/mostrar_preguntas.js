import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');
    const sessionToken = sessionStorage.getItem("sessionToken");
    let creatorName = "";

    if (!sessionToken || !username) redirectToHome();

    const nextQuestionButton = document.getElementById("nextQuestionButton");
    const logoutButton = document.getElementById("logoutButton");
    const lobbyButton = document.getElementById("lobbyButton");

    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        subscribeToSession();
        loadSessionDetails();
    });

    logoutButton.addEventListener("click", handleLogout);
    lobbyButton.addEventListener("click", returnToLobby);

    function subscribeToSession() {
        stompClient.subscribe(`/topic/${sessionCode}`, (message) => {
            try {
                const { event, question, numeroDePregunta } = JSON.parse(message.body);
                if (event === "update") updateUI(question, numeroDePregunta);
                if (event === "returnToLobby") redirectToLobby(false);
            } catch (error) {
                console.error("Error procesando el mensaje:", error);
            }
        });
    }

    function loadSessionDetails() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => response.json())
            .then(data => {
                creatorName = data.creator;
                setupUI();
                fetchCurrentQuestion();
            })
            .catch(() => alert("Error cargando datos. Recarga la página."));
    }

    function setupUI() {
        if (username === creatorName) {
            nextQuestionButton.style.display = "block";
            lobbyButton.style.display = "block";
            nextQuestionButton.addEventListener("click", fetchNextQuestion);
        }
    }

    function fetchCurrentQuestion() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/current-question`)
            .then(response => response.json())
            .then(data => updateUI(data.question, data.numeroDePregunta))
            .catch(() => console.error("Error mostrando la pregunta actual."));
    }

    function fetchNextQuestion() {
        const lastToUser = document.getElementById("toUser").textContent || "";
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/next-random-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastToUser })
        })
            .then(response => response.json())
            .then(data => sendQuestionUpdate(data))
            .catch(() => alert("No se pudo obtener la siguiente pregunta."));
    }

    function sendQuestionUpdate(data) {
        const { question, numeroDePregunta } = data;
        stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
            event: "update", question, numeroDePregunta
        }));
    }

    function updateUI(question, number) {
        document.getElementById("fromUser").textContent = question?.fromUser || "Anónimo";
        document.getElementById("toUser").textContent = question?.toUser || "-";
        document.getElementById("questionText").textContent = question?.question || "-";
        document.getElementById("questionNumber").textContent = number || "-";
    }

    function returnToLobby() {
        stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
            event: "returnToLobby",
            isCreator: true
        }));
        redirectToLobby(true);
    }

    function redirectToLobby(isCreator) {
        const url = isCreator
            ? `/pages/sesion_menu.html?sessionCode=${sessionCode}&username=${username}&role=creator`
            : `/pages/sesion_menu.html?sessionCode=${sessionCode}&username=${username}`;
        window.location.href = url;
    }

    function handleLogout() {
        fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, { method: "DELETE" })
            .then(() => {
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "userLeft", username
                }));
                clearSession();
            })
            .catch(() => alert("Error al cerrar sesión."));
    }

    function clearSession() {
        sessionStorage.clear();
        redirectToHome();
    }

    function redirectToHome() {
        window.location.href = "/index.html";
    }
});

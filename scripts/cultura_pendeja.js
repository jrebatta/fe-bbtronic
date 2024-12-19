import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');

    const nextQuestionButton = document.getElementById("nextQuestionButton");
    const logoutButton = document.getElementById("logoutButton");
    const questionText = document.getElementById("questionText");

    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        console.log("WebSocket conectado.");
        subscribeToQuestions();
        fetchSessionDetails();
    });

    logoutButton.addEventListener("click", handleLogout);
    nextQuestionButton.addEventListener("click", fetchNextQuestion);

    function subscribeToQuestions() {
        stompClient.subscribe(`/topic/${sessionCode}`, (message) => {
            try {
                const parsedMessage = JSON.parse(message.body);
                if (parsedMessage.event === "newCulturaPendejaQuestion") {
                    updateUI(parsedMessage.data.question);
                }
            } catch (error) {
                console.error("Error procesando mensaje:", error);
            }
        });
    }

    function handleLogout() {
        const sessionToken = sessionStorage.getItem("sessionToken");
        if (!sessionToken) return redirectToHome();

        fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, {
            method: "DELETE",
        })
            .then(response => response.text())
            .then(message => {
                if (message.includes("Sesión cerrada") || message.includes("Usuario no encontrado")) {
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "userLeft", username }));
                    clearSessionData();
                    redirectToHome();
                } else {
                    alert("Error inesperado al cerrar sesión.");
                }
            })
            .catch(error => console.error("Error cerrando sesión:", error));
    }

    function fetchNextQuestion() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/next-cultura-pendeja?tipo=all`)
            .then(response => {
                if (!response.ok) throw new Error("Error obteniendo la siguiente pregunta");
                return response.json();
            })
            .then(data => {
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "newCulturaPendejaQuestion", data: { question: data } }));
            })
            .catch(error => console.error("Error obteniendo pregunta:", error));
    }

    function fetchSessionDetails() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => {
                if (!response.ok) throw new Error("Error obteniendo detalles de la sesión");
                return response.json();
            })
            .then(data => {
                const isCreator = data.creator === username;
                nextQuestionButton.style.display = isCreator ? "block" : "none";
                if (isCreator) fetchNextQuestion();
            })
            .catch(error => console.error("Error obteniendo detalles:", error));
    }

    function updateUI(question) {
        questionText.textContent = question.texto;
    }

    function clearSessionData() {
        sessionStorage.removeItem("sessionToken");
        sessionStorage.removeItem("username");
    }

    function redirectToHome() {
        window.location.href = "/index.html";
    }
});
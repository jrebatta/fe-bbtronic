import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');
    const questionsContainer = document.getElementById("questionsContainer");
    const submitQuestionsButton = document.getElementById("submitQuestionsButton");
    const anonymousCheck = document.getElementById("anonymousCheck");
    const errorElement = document.getElementById("error");

    let questionsSent = false;

    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            try {
                const parsedMessage = JSON.parse(message.body);
                if (parsedMessage.event === "allReady") {
                    window.location.href = `mostrar_preguntas.html?sessionCode=${sessionCode}&username=${username}`;
                }
            } catch (error) {
                console.error("Error al procesar el mensaje del WebSocket:", error);
            }
        });
    });

    function loadUsers() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al cargar usuarios.");
                }
                return response.json();
            })
            .then(data => {
                data.users.forEach(user => {
                    if (user.username !== username) createQuestionInput(user.username);
                });
            })
            .catch(() => errorElement.textContent = "Error al cargar usuarios.");
    }

    function createQuestionInput(toUser) {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question-item");

        const label = document.createElement("label");
        label.textContent = `Pregunta para ${toUser}:`;

        const input = document.createElement("input");
        input.type = "text";
        input.dataset.toUser = toUser;

        questionDiv.appendChild(label);
        questionDiv.appendChild(input);
        questionsContainer.appendChild(questionDiv);
    }

    submitQuestionsButton.addEventListener("click", () => {
        if (questionsSent) return;
        questionsSent = true;

        const inputs = questionsContainer.querySelectorAll("input");
        let questionsReady = true;

        // Verificar que todos los inputs estén completos
        inputs.forEach(input => {
            const question = input.value.trim();
            if (!question) {
                questionsReady = false;
            }
        });

        // Solo enviar las preguntas si todos los campos están completos
        if (questionsReady) {
            inputs.forEach(input => {
                const question = input.value.trim();
                fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/send-question`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fromUser: username, toUser: input.dataset.toUser, question, anonymous: anonymousCheck.checked })
                });
            });
            setUserReady();
        } else {
            // Mostrar mensaje de error y permitir intentar de nuevo
            questionsSent = false;
            errorElement.textContent = "Por favor, completa todas las preguntas antes de continuar.";
        }
    });

    function setUserReady() {
        fetch(`${API_BASE_URL}/api/users/${username}/ready`, { method: "POST" })
            .then(() => {
                console.log("Usuario marcado como listo.");
                checkAllReady(); // Llama a la verificación
            })
            .catch(error => console.error("Error al marcar usuario como listo:", error));
    }

    function checkAllReady() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/check-all-ready`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al verificar si todos están listos.");
                }
                return response.json();
            })
            .then(data => {
                if (data.allReady) {
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "allReady" }));
                } else {
                    // Mostrar el mensaje en pantalla
                    errorElement.textContent = data.message || "Aún faltan usuarios por estar listos.";
                }
            })
            .catch(error => console.error("Error al verificar si todos están listos:", error));
    }

    loadUsers();
});
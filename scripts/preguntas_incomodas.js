document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');
    const questionsContainer = document.getElementById("questionsContainer");
    const submitQuestionsButton = document.getElementById("submitQuestionsButton");
    const anonymousCheck = document.getElementById("anonymousCheck");
    const errorElement = document.getElementById("error");

    // Validar si el botón existe antes de agregar el event listener
    if (!submitQuestionsButton) {
        console.error("El botón 'submitQuestionsButton' no se encontró en el DOM.");
        return;
    }

    let questionsSent = false;

    const socket = new SockJS('http://localhost:8080/websocket');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            try {
                const parsedMessage = JSON.parse(message.body);

                if (parsedMessage.event === "allReady") {
                    console.log("Todos los usuarios están listos. Redirigiendo...");
                    window.location.href = `mostrar_preguntas.html?sessionCode=${sessionCode}&username=${username}`;
                }
            } catch (error) {
                console.error("Error al procesar el mensaje del WebSocket:", error);
            }
        });
    });

    // Cargar la lista de usuarios y generar inputs de preguntas
    function loadUsers() {
        fetch(`http://localhost:8080/api/game-sessions/${sessionCode}/users`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al cargar usuarios.");
                }
                return response.json();
            })
            .then(data => {
                if (data.users && Array.isArray(data.users)) {
                    console.log("Usuarios cargados:", data.users);
                    data.users.forEach(user => {
                        if (user.username !== username) { // Excluir al usuario actual
                            createQuestionInput(user.username);
                        }
                    });
                } else {
                    console.error("Formato de usuarios inválido:", data.users);
                }
            })
            .catch(error => {
                console.error("Error al cargar usuarios:", error);
                errorElement.textContent = "Error al cargar usuarios.";
            });
    }

    // Crear un campo de entrada para una pregunta hacia un usuario específico
    function createQuestionInput(toUser) {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("mb-3");

        const label = document.createElement("label");
        label.textContent = `Pregunta para ${toUser}:`;
        label.classList.add("form-label");

        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("form-control");
        input.placeholder = `Escribe una pregunta para ${toUser}`;
        input.dataset.toUser = toUser;

        questionDiv.appendChild(label);
        questionDiv.appendChild(input);
        questionsContainer.appendChild(questionDiv);
    }

    // Enviar preguntas y marcar al usuario como listo
    submitQuestionsButton.addEventListener("click", function () {
        if (questionsSent) return; // Evitar duplicados
        questionsSent = true;

        const inputs = questionsContainer.querySelectorAll("input");
        let questionsReady = true;

        inputs.forEach(input => {
            const question = input.value.trim();
            const toUser = input.dataset.toUser;

            if (question) {
                fetch(`http://localhost:8080/api/game-sessions/${sessionCode}/send-question`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ fromUser: username, toUser: toUser, question: question, anonymous: anonymousCheck.checked })
                }).catch(error => console.error("Error al enviar la pregunta:", error));
            } else {
                questionsReady = false;
            }
        });

        if (questionsReady) {
            setUserReady();
        } else {
            questionsSent = false;
            errorElement.textContent = "Por favor, escribe todas las preguntas antes de continuar.";
        }
    });

    // Marcar al usuario como listo y verificar si todos están listos
    function setUserReady() {
        fetch(`http://localhost:8080/api/users/${username}/ready`, {
            method: "POST"
        })
            .then(() => {
                console.log("Usuario marcado como listo.");
                checkAllReady();
            })
            .catch(error => console.error("Error al marcar usuario como listo:", error));
    }

    // Verificar si todos los usuarios están listos
    function checkAllReady() {
        fetch(`http://localhost:8080/api/game-sessions/${sessionCode}/check-all-ready`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al verificar si todos están listos.");
                }
                return response.json();
            })
            .then(data => {
                if (data.allReady) {
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "allReady" }));
                }
            })
            .catch(error => console.error("Error al verificar si todos están listos:", error));
    }

    // Inicialización
    loadUsers();
});

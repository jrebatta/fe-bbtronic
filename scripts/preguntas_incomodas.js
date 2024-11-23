document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');
    const questionsContainer = document.getElementById("questionsContainer");
    const submitQuestionsButton = document.getElementById("submitQuestionsButton");

    // Validar si el botón existe antes de agregar el event listener
    if (!submitQuestionsButton) {
        console.error("El botón 'submitQuestionsButton' no se encontró en el DOM.");
        return;
    }

    let questionsSent = false;

    const socket = new SockJS('http://192.168.18.18:8080/websocket');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            console.log("Mensaje recibido:", message.body);

            if (message.body === "allReady") {
                window.location.href = `mostrar_preguntas.html?sessionCode=${sessionCode}&username=${username}`;
            }
        });
    });

    // Cargar la lista de usuarios y generar inputs de preguntas
    function loadUsers() {
        fetch(`http://192.168.18.18:8080/api/game-sessions/${sessionCode}/users`)
            .then(response => response.json())
            .then(data => {
                if (data.users && Array.isArray(data.users)) {
                    data.users.forEach(user => {
                        if (user.username !== username) { // Excluir al usuario actual
                            createQuestionInput(user.username);
                        }
                    });
                }
            })
            .catch(error => {document.addEventListener('DOMContentLoaded', function () {
                const urlParams = new URLSearchParams(window.location.search);
                const sessionCode = urlParams.get('sessionCode');
                const username = urlParams.get('username');
                const questionsContainer = document.getElementById("questionsContainer");
                const submitQuestionsButton = document.getElementById("submitQuestionsButton");
            
                // Validar si el botón existe antes de agregar el event listener
                if (!submitQuestionsButton) {
                    console.error("El botón 'submitQuestionsButton' no se encontró en el DOM.");
                    return;
                }
            
                let questionsSent = false;
            
                const socket = new SockJS('http://192.168.18.18:8080/websocket');
                const stompClient = Stomp.over(socket);
            
                stompClient.connect({}, function () {
                    stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
                        console.log("Mensaje recibido:", message.body);
            
                        if (message.body === "allReady") {
                            window.location.href = `mostrar_preguntas.html?sessionCode=${sessionCode}&username=${username}`;
                        }
                    });
                });
            
                // Cargar la lista de usuarios y generar inputs de preguntas
                function loadUsers() {
                    fetch(`http://192.168.18.18:8080/api/game-sessions/${sessionCode}/users`, {
                        method: "GET",
                        mode: "no-cors", // Agregado para evitar restricciones CORS
                    })
                    .then(() => {
                        console.log("Solicitud enviada, pero no se puede procesar la respuesta.");
                    })
                    .catch(error => {
                        console.error("Error al cargar usuarios:", error);
                        document.getElementById("error").textContent = "Error al cargar usuarios.";
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
                    const anonymousCheck = document.getElementById("anonymousCheck").checked;
                    let questionsReady = true;
            
                    inputs.forEach(input => {
                        const question = input.value.trim();
                        const toUser = input.dataset.toUser;
            
                        if (question) {
                            fetch(`http://192.168.18.18:8080/api/game-sessions/${sessionCode}/send-question`, {
                                method: "POST",
                                mode: "no-cors", // Agregado para evitar restricciones CORS
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ fromUser: username, toUser: toUser, question: question, anonymous: anonymousCheck })
                            }).catch(error => console.error("Error al enviar la pregunta:", error));
                        } else {
                            questionsReady = false;
                        }
                    });
            
                    if (questionsReady) {
                        setUserReady();
                    } else {
                        questionsSent = false;
                        document.getElementById("error").textContent = "Por favor, escribe todas las preguntas antes de continuar.";
                    }
                });
            
                // Marcar al usuario como listo y verificar si todos están listos
                function setUserReady() {
                    fetch(`http://192.168.18.18:8080/api/users/${username}/ready`, {
                        method: "POST",
                        mode: "no-cors", // Agregado para evitar restricciones CORS
                    })
                    .then(() => {
                        console.log("Usuario marcado como listo. Verificando si todos están listos...");
                        fetch(`http://192.168.18.18:8080/api/game-sessions/${sessionCode}/check-all-ready`, {
                            method: "GET",
                            mode: "no-cors", // Agregado para evitar restricciones CORS
                        })
                        .then(() => {
                            console.log("Solicitud enviada, pero no se puede procesar la respuesta.");
                        })
                        .catch(error => console.error("Error al verificar si todos están listos:", error));
                    })
                    .catch(error => console.error("Error al marcar usuario como listo:", error));
                }
            
                // Inicialización
                loadUsers();
            });
            
                console.error("Error al cargar usuarios:", error);
                document.getElementById("error").textContent = "Error al cargar usuarios.";
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
        const anonymousCheck = document.getElementById("anonymousCheck").checked;
        let questionsReady = true;

        inputs.forEach(input => {
            const question = input.value.trim();
            const toUser = input.dataset.toUser;

            if (question) {
                fetch(`http://192.168.18.18:8080/api/game-sessions/${sessionCode}/send-question`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ fromUser: username, toUser: toUser, question: question, anonymous: anonymousCheck })
                }).catch(error => console.error("Error al enviar la pregunta:", error));
            } else {
                questionsReady = false;
            }
        });

        if (questionsReady) {
            setUserReady();
        } else {
            questionsSent = false;
            document.getElementById("error").textContent = "Por favor, escribe todas las preguntas antes de continuar.";
        }
    });

    // Marcar al usuario como listo y verificar si todos están listos
    function setUserReady() {
        fetch(`http://192.168.18.18:8080/api/users/${username}/ready`, {
            method: "POST",
            mode: "no-cors", // Agregado para evitar restricciones CORS
        })
            .then(() => {
                console.log("Usuario marcado como listo. Verificando si todos están listos...");
                fetch(`http://192.168.18.18:8080/api/game-sessions/${sessionCode}/check-all-ready`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.allReady) {
                            stompClient.send(`/app/checkAllReady/${sessionCode}`); // Fuerza la validación en el backend
                        }
                    })
                    .catch(error => console.error("Error al verificar si todos están listos:", error));
            })
            .catch(error => console.error("Error al marcar usuario como listo:", error));
    }

    // Inicialización
    loadUsers();
});

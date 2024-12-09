import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');
    const sessionToken = sessionStorage.getItem("sessionToken"); // Obtener el sessionToken de sessionStorage
    let creatorName = "";

    // Verificar si sessionToken y username están presentes
    if (!sessionToken || !username) {
        console.error("Falta sessionToken o username. Redirigiendo a la página de inicio.");
        window.location.href = "/index.html";
        return;
    }

    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    // Conectar al WebSocket y suscribirse al canal
    stompClient.connect({}, function () {
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            try {
                const parsedMessage = JSON.parse(message.body);

                if (parsedMessage.event === "update" && parsedMessage.question) {
                    console.log("Nueva pregunta recibida por WebSocket:", parsedMessage.question);

                    // Actualizar la UI con la nueva pregunta
                    const { fromUser, toUser, question } = parsedMessage.question;
                    const numeroDePregunta = parsedMessage.numeroDePregunta || "-";
                    document.getElementById("fromUser").textContent = fromUser || "Anónimo";
                    document.getElementById("toUser").textContent = toUser;
                    document.getElementById("questionText").textContent = question;
                    document.getElementById("questionNumber").textContent = numeroDePregunta;
                }
            } catch (error) {
                console.error("Error al procesar el mensaje del WebSocket:", error);
            }
        });
    });

    // Carga inicial de datos para obtener el nombre del creador
    function loadInitialData() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar datos iniciales");
                return response.json();
            })
            .then(data => {
                creatorName = data.creator;
                setupUIForUserRole();
                displayCurrentQuestion();
            })
            .catch(error => {
                console.error("Error al cargar datos iniciales:", error);
                alert("Error al cargar datos iniciales. Por favor, recarga la página.");
            });
    }

    // Configura la UI según si el usuario es creador o no
    function setupUIForUserRole() {
        const nextQuestionButton = document.getElementById("nextQuestionButton");
        if (username === creatorName) {
            nextQuestionButton.style.display = "block";
            nextQuestionButton.addEventListener("click", goToNextQuestion);
        } else {
            nextQuestionButton.style.display = "none";
        }
    }

    // Muestra la pregunta actual desde el backend
    function displayCurrentQuestion() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/current-question`)
            .then(response => {
                if (!response.ok) throw new Error("Error al obtener la pregunta actual");
                return response.json();
            })
            .then(data => {
                console.log("Pregunta actual recibida:", data);

                if (data && data.question) {
                    document.getElementById("fromUser").textContent = data.question.fromUser || "Anónimo";
                    document.getElementById("toUser").textContent = data.question.toUser;
                    document.getElementById("questionText").textContent = data.question.question;
                    document.getElementById("questionNumber").textContent = data.numeroDePregunta || "-";
                } else {
                    console.warn("No se recibió una pregunta válida");
                }
            })
            .catch(error => {
                console.error("Error al mostrar la pregunta actual:", error);
            });
    }

    function goToNextQuestion() {
        const lastToUser = document.getElementById("toUser")?.textContent || "";

        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/next-random-question`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ lastToUser: lastToUser })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al avanzar a la siguiente pregunta");
                }
                return response.json(); // Parsear la respuesta JSON
            })
            .then(data => {
                if (data && data.question) {
                    console.log("Siguiente pregunta recibida:", data.question);

                    // Enviar la nueva pregunta a través del WebSocket
                    stompClient.send(
                        `/topic/${sessionCode}`,
                        {},
                        JSON.stringify({ event: "update", question: data.question, numeroDePregunta: data.numeroDePregunta })
                    );

                    // Actualizar la UI local
                    document.getElementById("fromUser").textContent = data.question.fromUser || "Anónimo";
                    document.getElementById("toUser").textContent = data.question.toUser;
                    document.getElementById("questionText").textContent = data.question.question;
                    document.getElementById("questionNumber").textContent = data.numeroDePregunta || "-";
                } else {
                    console.error("La respuesta no contiene una pregunta válida:", data);
                }
            })
            .catch(error => {
                console.error("Error al avanzar a la siguiente pregunta:", error);
                alert("No se pudo avanzar a la siguiente pregunta. Por favor, inténtalo de nuevo.");
            });
    }

    // Botón para salir de la sesión
    document.getElementById("logoutButton").addEventListener("click", function () {
        if (!sessionToken) {
            console.error("No se encontró sessionToken. Redirigiendo a inicio.");
            window.location.href = "/index.html";
            return;
        }
    
        fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, {
            method: "DELETE"
        })
            .then(response => response.text())
            .then(message => {
                if (message.includes("Sesión cerrada") || message.includes("Usuario no encontrado")) {
                    console.log("Sesión cerrada correctamente.");
    
                    // Notificar al servidor que el usuario salió
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                        event: "userLeft",
                        username: username
                    }));
    
                    sessionStorage.removeItem("sessionToken");
                    sessionStorage.removeItem("username");
                    window.location.href = "/index.html";
                } else {
                    alert("Error al cerrar sesión.");
                }
            })
            .catch(error => console.error("Error cerrando sesión:", error));
    });
    

    // Inicialización
    loadInitialData();
});

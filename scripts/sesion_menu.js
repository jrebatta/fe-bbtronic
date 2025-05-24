import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');

    // Eliminar la cadena de consulta de la URL
    const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);

    const sessionToken = sessionStorage.getItem("sessionToken");
    if (!sessionToken || !username) {
        window.location.href = "/index.html";
        return;
    }

    document.getElementById("sessionCode").textContent = sessionCode;

    // Conexión al WebSocket
    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        console.log("WebSocket conectado.");

        // Suscribirse al canal de la sesión para actualizaciones
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            try {
                const parsedMessage = JSON.parse(message.body);

                switch (parsedMessage.event) {
                    case "gameStarted":
                        console.log("Juego iniciado, redirigiendo...");
                        window.location.href = `preguntas_directas.html?sessionCode=${sessionCode}&username=${username}`;
                        break;
                    case "yoNuncaNuncaStarted":
                        console.log("Yo Nunca Nunca iniciado, redirigiendo...");
                        window.location.href = `yo_nunca_nunca.html?sessionCode=${sessionCode}&username=${username}`;
                        break;
                    case "preguntasIncomodasStarted":
                        console.log("Preguntas Incomodas iniciado, redirigiendo...");
                        window.location.href = `preguntas_incomodas.html?sessionCode=${sessionCode}&username=${username}`;
                        break;
                    case "quienEsMasProbableStarted":
                        console.log("Quien Es Más Probable iniciado, redirigiendo...");
                        window.location.href = `quien_es_mas_probable.html?sessionCode=${sessionCode}&username=${username}`;
                        break;
                    case "culturaPendejaStarted":
                        console.log("Cultura Pendeja iniciado, redirigiendo...");
                        window.location.href = `cultura_pendeja.html?sessionCode=${sessionCode}&username=${username}`;
                        break;
                    case "userUpdate":
                        if (Array.isArray(parsedMessage.users)) {
                            console.log("Lista de usuarios actualizada:", parsedMessage.users);
                            updateUserList(parsedMessage.users);
                        }
                        break;
                    case "userLeft":
                        if (parsedMessage.username) {
                            console.log(`Usuario ${parsedMessage.username} salió de la sesión.`);
                            removeUserFromList(parsedMessage.username);
                        }
                        break;
                    case "sessionEnded":
                        console.log("Sesión terminada, redirigiendo...");
                        sessionStorage.clear();
                        window.location.href = "index.html";
                        break;
                    default:
                        console.error("Evento desconocido:", parsedMessage.event);
                }
            } catch (error) {
                console.error("Error al procesar el mensaje del WebSocket:", error);
            }
        });
    }, function (error) {
        console.error("Error en la conexión del WebSocket:", error);
        document.getElementById("error").textContent = "No se pudo conectar al servidor. Intenta recargar la página.";
    });

    // Mostrar botones solo para el creador de la sesión
    function setupButtonsForCreator(isCreator) {
    const buttonIds = [
        "startGameButton",
        "preguntasIncomodas",
        "yoNuncaNunca",
        "quienEsMasProbable",
        "culturaPendeja",
        "kickButton"
    ];

    // Mostrar u ocultar botones según sea creador
    buttonIds.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.style.display = isCreator ? "block" : "none";
        }
    });

    if (isCreator) {
        const startBtn = document.getElementById("startGameButton");
        if (startBtn) startBtn.addEventListener("click", startGame);

        const preguntasBtn = document.getElementById("preguntasIncomodas");
        if (preguntasBtn) preguntasBtn.addEventListener("click", startPreguntasIncomodas);

        const nuncaBtn = document.getElementById("yoNuncaNunca");
        if (nuncaBtn) nuncaBtn.addEventListener("click", startYoNuncaNunca);

        const probableBtn = document.getElementById("quienEsMasProbable");
        if (probableBtn) probableBtn.addEventListener("click", startQuienEsMasProbable);

        const culturaBtn = document.getElementById("culturaPendeja");
        if (culturaBtn) culturaBtn.addEventListener("click", startCulturaPendeja);

        const kickBtn = document.getElementById("kickButton");
        if (kickBtn) kickBtn.addEventListener("click", showKickModal);
    }
}

    // Función para iniciar el juego "Preguntas Directas"
    function startGame() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/start-game`, {
            method: "POST"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Juego iniciado. Enviando evento a través del WebSocket.");
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "gameStarted" }));
                } else {
                    throw new Error("Error al iniciar el juego.");
                }
            })
            .catch(error => console.error("Error al iniciar el juego:", error));
    }

    function startYoNuncaNunca() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/yo-nunca-nunca/start`, {
            method: "POST"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Yo Nunca Nunca iniciado. Enviando evento a través del WebSocket.");
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "yoNuncaNuncaStarted" }));
                } else {
                    throw new Error("Error al iniciar Yo Nunca Nunca.");
                }
            })
            .catch(error => console.error("Error al iniciar Yo Nunca Nunca:", error));
    }

    function startPreguntasIncomodas() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/start-preguntas-incomodas`, {
            method: "POST"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Preguntas incómodas iniciado. Enviando evento a través del WebSocket.");
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "preguntasIncomodasStarted" }));
                } else {
                    throw new Error("Error al iniciar Preguntas Incómodas.");
                }
            })
            .catch(error => console.error("Error al iniciar Preguntas Incómodas:", error));
    }

    function startQuienEsMasProbable() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/quien-es-mas-probable/start`, {
            method: "POST"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Quién Es Más Probable iniciado. Enviando evento a través del WebSocket.");
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "quienEsMasProbableStarted" }));
                } else {
                    throw new Error("Error al iniciar Quién Es Más Probable.");
                }
            })
            .catch(error => console.error("Error al iniciar Quién Es Más Probable:", error));
    }

    function startCulturaPendeja() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/cultura-pendeja/start`, {
            method: "POST"
        })
            .then(response => {
                if (response.ok) {
                    console.log("Cultura Pendeja iniciada. Enviando evento a través del WebSocket.");
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "culturaPendejaStarted" }));
                } else {
                    throw new Error("Error al iniciar Cultura Pendeja.");
                }
            })
            .catch(error => console.error("Error al iniciar Cultura Pendeja:", error));
    }

    // Botón para salir de la sesión
    document.getElementById("logoutButton").addEventListener("click", async function () {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, {
                method: "DELETE"
            });

            const message = await response.text();
            if (message.includes("Sesión cerrada") || message.includes("Usuario no encontrado")) {
                console.log("Sesión cerrada correctamente.");

                // Notificar al servidor que el usuario salió
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "userLeft",
                    username: username
                }));

                sessionStorage.clear();
                window.location.href = "/index.html";
            } else {
                alert("Error al cerrar sesión.");
            }
        } catch (error) {
            console.error("Error cerrando sesión:", error);
        }
    });

    // Cargar usuarios al inicializar
    function loadInitialUsers() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al cargar los datos de la sesión.");
                }
                return response.json();
            })
            .then(data => {
                console.log("Usuarios iniciales cargados:", data.users);

                // Mostrar botones solo si el usuario es el creador
                setupButtonsForCreator(data.creator === username);

                updateUserList(data.users);
            })
            .catch(error => {
                console.error("Error al cargar usuarios iniciales:", error);
                document.getElementById("error").textContent = "Error al cargar usuarios en la sesión.";
            });
    }

    // Actualizar la lista de usuarios en la UI
    function updateUserList(users) {
        const userList = document.getElementById("userList");
        userList.innerHTML = ""; // Limpia la lista actual

        if (!Array.isArray(users)) {
            console.error("Formato de usuarios inválido:", users);
            return;
        }

        users.forEach(user => {
            const li = document.createElement("li");
            li.classList.add("list-group-item"); // Clase para el estilo individual
            li.id = `user-${user.username}`; // Asigna un ID único basado en el nombre de usuario

            const usernameSpan = document.createElement("span");
            usernameSpan.textContent = `${user.username} ${user.ready ? '(Listo)' : ''}`; // Texto con estado

            li.appendChild(usernameSpan);

            userList.appendChild(li); // Agregar al contenedor de lista
        });
    }

    // Mostrar modal para elegir usuario a expulsar
    function showKickModal() {
        const kickModal = document.getElementById("kickModal");
        const kickUserList = document.getElementById("kickUserList");
        kickUserList.innerHTML = ""; // Limpia la lista actual

        const userList = document.getElementById("userList");
        const users = userList.getElementsByTagName("li");

        for (let user of users) {
            if (user.id !== `user-${username}`) {
                const li = document.createElement("li");
                li.classList.add("list-group-item");
                li.textContent = user.textContent.trim();
                li.addEventListener("click", () => {
                    const confirmKick = confirm(`¿Deseas expulsar a ${user.textContent.trim()} de la sesión?`);
                    if (confirmKick) {
                        const sessionToken = user.id.split('-')[1];
                        kickUser(sessionToken, user.textContent.trim());
                        kickModal.style.display = "none";
                    }
                });
                kickUserList.appendChild(li);
            }
        }

        kickModal.style.display = "block";

        // Cerrar el modal cuando se hace clic en la "x"
        const closeModal = document.getElementsByClassName("close")[0];
        closeModal.onclick = function() {
            kickModal.style.display = "none";
        }

        // Cerrar el modal cuando se hace clic fuera del modal
        window.onclick = function(event) {
            if (event.target == kickModal) {
                kickModal.style.display = "none";
            }
        }
    }

    // Eliminar un usuario específico de la lista
    function removeUserFromList(username) {
        const userItem = document.getElementById(`user-${username}`);
        if (userItem) {
            userItem.remove();
        } else {
            console.error(`Usuario ${username} no encontrado en la lista.`);
        }
    }

    // Función para expulsar a un usuario
    async function kickUser(sessionToken, username) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, {
                method: "DELETE"
            });

            const message = await response.text();
            if (message.includes("Sesión cerrada") || message.includes("Usuario no encontrado")) {
                console.log(`Usuario ${username} expulsado correctamente.`);

                // Notificar al servidor que el usuario fue expulsado
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "userLeft",
                    username: username
                }));

                removeUserFromList(username);
            } else {
                alert("Error al expulsar usuario.");
            }
        } catch (error) {
            console.error(`Error expulsando al usuario ${username}:`, error);
        }
    }

    // Inicializar y cargar usuarios al cargar la página
    loadInitialUsers();
});
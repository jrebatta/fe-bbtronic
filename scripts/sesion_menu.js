document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');

    // Eliminar la cadena de consulta de la URL
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    const sessionToken = localStorage.getItem("sessionToken");
    if (!sessionToken || !username) {
        window.location.href = "/index.html";
        return;
    }

    document.getElementById("sessionCode").textContent = sessionCode;

    // Conexión al WebSocket
    const socket = new SockJS('https://be-bbtronic.onrender.com/websocket');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        console.log("WebSocket conectado.");

        // Suscribirse al canal de la sesión para actualizaciones
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            try {
                const parsedMessage = JSON.parse(message.body);

                if (parsedMessage.event === "gameStarted") {
                    console.log("Juego iniciado, redirigiendo...");
                    window.location.href = `preguntas_incomodas.html?sessionCode=${sessionCode}&username=${username}`;
                }

                if (parsedMessage.event === "userUpdate" && Array.isArray(parsedMessage.users)) {
                    console.log("Lista de usuarios actualizada:", parsedMessage.users);
                    updateUserList(parsedMessage.users); // Actualiza usuarios al recibir el evento
                }
            } catch (error) {
                console.error("Error al procesar el mensaje del WebSocket:", error);
            }
        });

    }, function (error) {
        console.error("Error en la conexión del WebSocket:", error);
        document.getElementById("error").textContent = "No se pudo conectar al servidor. Intenta recargar la página.";
    });

    // Botón para iniciar el juego
    document.getElementById("startGameButton").addEventListener("click", function () {
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}/start-game`, {
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
    });

    // Botón para salir de la sesión
    document.getElementById("logoutButton").addEventListener("click", function () {
        fetch(`https://be-bbtronic.onrender.com/api/users/logout?sessionToken=${sessionToken}`, {
            method: "DELETE"
        })
            .then(response => response.text())
            .then(message => {
                if (message.includes("Sesión cerrada") || message.includes("Usuario no encontrado")) {
                    console.log("Sesión cerrada correctamente.");

                    // Notificar al servidor y a los demás clientes
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                        event: "userUpdate"
                    }));

                    localStorage.removeItem("sessionToken");
                    localStorage.removeItem("username");
                    window.location.href = "/index.html";
                } else {
                    alert("Error al cerrar sesión.");
                }
            })
            .catch(error => console.error("Error cerrando sesión:", error));
    });

    // Cargar usuarios al inicializar
    function loadInitialUsers() {
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al cargar los datos de la sesión.");
                }
                return response.json();
            })
            .then(data => {
                console.log("Usuarios iniciales cargados:", data.users);
                if (data.creator === username) {
                    document.getElementById("startGameButton").style.display = "block";
                } else {
                    document.getElementById("startGameButton").style.display = "none";
                }
                updateUserList(data.users); // Actualiza la lista de usuarios iniciales
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
            li.textContent = `${user.username} ${user.ready ? '(Listo)' : ''}`; // Texto con estado
            userList.appendChild(li); // Agregar al contenedor de lista
        });
    }

    // Inicializar y cargar usuarios al cargar la página
    loadInitialUsers();
});

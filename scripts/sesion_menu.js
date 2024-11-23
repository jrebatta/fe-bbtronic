document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');

    const sessionToken = localStorage.getItem("sessionToken");
    if (!sessionToken || !username) {
        window.location.href = "/pages/menu_juego.html";
        return;
    }

    document.getElementById("sessionCode").textContent = sessionCode;

    // Conexión al WebSocket
    const socket = new SockJS('https://be-bbtronic.onrender.com/websocket');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        // Suscribirse al canal de la sesión para actualizaciones
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            try {
                const parsedMessage = JSON.parse(message.body);

                // Si el juego ha comenzado
                if (parsedMessage.event === "gameStarted") {
                    window.location.href = `preguntas_incomodas.html?sessionCode=${sessionCode}&username=${username}`;
                }

                // Si hay una actualización de la lista de usuarios
                if (parsedMessage.event === "userUpdate") {
                    updateUserList(parsedMessage.users);
                }
            } catch (error) {
                console.error("Error al procesar el mensaje del WebSocket:", error);
            }
        });
    });

    // Actualizar la lista de usuarios en la UI
    function updateUserList(users) {
        const userList = document.getElementById("userList");
        userList.innerHTML = "";

        users.forEach(user => {
            const li = document.createElement("li");
            li.textContent = user.username;
            userList.appendChild(li);
        });

        // Mostrar botón de iniciar juego si es el creador
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}`)
            .then(response => response.json())
            .then(data => {
                if (data.creator === username) {
                    document.getElementById("startGameButton").style.display = "block";
                } else {
                    document.getElementById("startGameButton").style.display = "none";
                }
            })
            .catch(error => console.error("Error al verificar el creador:", error));
    }

    // Botón para iniciar el juego
    document.getElementById("startGameButton").addEventListener("click", function () {
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}/start-game`, {
            method: "POST"
        })
            .then(response => {
                if (response.ok) {
                    stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "gameStarted" }));
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
                    localStorage.removeItem("sessionToken");
                    localStorage.removeItem("username");
                    window.location.href = "/pages/menu_juego.html";
                } else {
                    alert("Error al cerrar sesión.");
                }
            })
            .catch(error => console.error("Error cerrando sesión:", error));
    });

    // Cargar usuarios al inicializar
    function loadInitialUsers() {
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}/users`)
            .then(response => response.json())
            .then(data => updateUserList(data.users))
            .catch(error => {
                console.error("Error al cargar usuarios iniciales:", error);
                document.getElementById("error").textContent = "Error al cargar usuarios en la sesión.";
            });
    }

    loadInitialUsers();
});

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');
    let creatorName = "";

    const socket = new SockJS('https://be-bbtronic.onrender.com/websocket');
    const stompClient = Stomp.over(socket);

    // Conectar al WebSocket y suscribirse al canal
    stompClient.connect({}, function () {
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            console.log("Mensaje recibido por WebSocket:", message.body);

            if (message.body === "update") {
                console.log("Evento 'update' recibido. Actualizando la pregunta actual.");
                displayCurrentQuestion(); // Actualizar la pregunta actual cuando se recibe el evento
            }
        });
    });

    // Carga inicial de datos para obtener el nombre del creador
    function loadInitialData() {
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}`)
            .then(response => response.json())
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
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}/current-question`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    console.log("Pregunta actual recibida:", data);
                    document.getElementById("fromUser").textContent = data.fromUser || "Anónimo";
                    document.getElementById("toUser").textContent = data.toUser;
                    document.getElementById("questionText").textContent = data.question;
                }
            })
            .catch(error => console.error("Error al mostrar la pregunta actual:", error));
    }

    // Avanza a la siguiente pregunta (sólo el creador puede hacerlo)
    function goToNextQuestion() {
        const lastToUser = document.getElementById("toUser")?.textContent || "";
    
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}/next-random-question`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                lastToUser: lastToUser
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al avanzar a la siguiente pregunta");
                }
    
                console.log("Siguiente pregunta solicitada. Enviando evento de actualización.");
                // Enviar evento de actualización a través del WebSocket
                stompClient.send(`/app/updateQuestion/${sessionCode}`, {}, "update");
            })
            .catch(error => {
                console.error("Error al avanzar a la siguiente pregunta:", error);
                alert("No se pudo avanzar a la siguiente pregunta. Por favor, inténtalo de nuevo.");
            });
    }
    

    // Inicialización
    loadInitialData();
});

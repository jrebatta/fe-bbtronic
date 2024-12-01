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
            try {
                const parsedMessage = JSON.parse(message.body);
    
                if (parsedMessage.event === "update" && parsedMessage.question) {
                    console.log("Nueva pregunta recibida por WebSocket:", parsedMessage.question);
    
                    // Actualizar la UI con la nueva pregunta
                    const { fromUser, toUser, question } = parsedMessage.question;
                    document.getElementById("fromUser").textContent = fromUser || "Anónimo";
                    document.getElementById("toUser").textContent = toUser;
                    document.getElementById("questionText").textContent = question;
                }
            } catch (error) {
                console.error("Error al procesar el mensaje del WebSocket:", error);
            }
        });
    });
    
    

    // Carga inicial de datos para obtener el nombre del creador
    function loadInitialData() {
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}`)
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
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}/current-question`)
            .then(response => {
                if (!response.ok) throw new Error("Error al obtener la pregunta actual");
                return response.json();
            })
            .then(data => {
                console.log("Pregunta actual recibida:", data);

                if (data) {
                    document.getElementById("fromUser").textContent = data.fromUser || "Anónimo";
                    document.getElementById("toUser").textContent = data.toUser;
                    document.getElementById("questionText").textContent = data.question;
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

    fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}/next-random-question`, {
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
                    JSON.stringify({ event: "update", question: data.question })
                );
            } else {
                console.error("La respuesta no contiene una pregunta válida:", data);
            }
        })
        .catch(error => {
            console.error("Error al avanzar a la siguiente pregunta:", error);
            alert("No se pudo avanzar a la siguiente pregunta. Por favor, inténtalo de nuevo.");
        });
}


    // Inicialización
    loadInitialData();
});

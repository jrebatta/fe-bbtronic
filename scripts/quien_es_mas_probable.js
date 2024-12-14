import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');

    const votingSection = document.getElementById("votingSection");
    const userButtons = document.getElementById("userButtons");
    const resultsSection = document.getElementById("resultsSection");
    const winnerName = document.getElementById("winnerName");
    const showResultsButton = document.getElementById("showResultsButton");
    const nextQuestionButton = document.getElementById("nextQuestionButton");

    // Conexión al WebSocket
    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        console.log("WebSocket conectado.");

        // Suscribirse al canal para recibir preguntas y resultados
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            try {
                const parsedMessage = JSON.parse(message.body);

                if (parsedMessage.event === "newQuienEsMasProbableQuestion") {
                    const question = parsedMessage.data;
                    updateUI(question);
                }

                if (parsedMessage.event === "votingResults") {
                    const winner = parsedMessage.winner;
                    displayResults(winner); // Mostrar el ganador a todos los usuarios
                }
            } catch (error) {
                console.error("Error al procesar el mensaje del WebSocket:", error);
            }
        });

        fetchSessionDetails();
    });

    document.getElementById("logoutButton").addEventListener("click", function () {
        const sessionToken = sessionStorage.getItem("sessionToken");

        if (!sessionToken) {
            window.location.href = "/index.html";
            return;
        }

        fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, {
            method: "DELETE"
        })
            .then(response => response.text())
            .then(message => {
                console.log(message);
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "userLeft",
                    username
                }));

                sessionStorage.removeItem("sessionToken");
                sessionStorage.removeItem("username");
                window.location.href = "/index.html";
            })
            .catch(error => console.error("Error cerrando sesión:", error));
    });

    nextQuestionButton.addEventListener("click", fetchNextQuestion);

    showResultsButton.addEventListener("click", function () {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/check-all-voted`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudo verificar si todos han votado.");
                }
                return response.json();
            })
            .then(data => {
                if (data.allVoted) {
                    fetchVoteResults();
                } else {
                    alert("Aún no todos los usuarios han votado.");
                }
            })
            .catch(error => console.error("Error al verificar los votos:", error));
    });

    function updateUI(question) {
        document.getElementById("questionText").textContent = question;
        resultsSection.style.display = "none";
        votingSection.style.display = "block";

        generateVotingButtons(JSON.parse(sessionStorage.getItem("users")) || []);
        showResultsButton.disabled = false;
    }

    function generateVotingButtons(users) {
        userButtons.innerHTML = ""; // Limpia los botones existentes
        users.forEach(user => {
            const button = document.createElement("button");
            button.classList.add("btn-general"); // Clase compartida para el estilo
            button.textContent = user.username; // Texto del botón
            button.disabled = false; // Habilitar botón
            button.onclick = () => sendVote(user.username); // Acción al hacer clic
            userButtons.appendChild(button); // Agregar botón al contenedor
        });
    } 
      
    function sendVote(votedUser) {
        const votingUser = username;
    
        if (!votingUser) {
            console.error("No se pudo obtener el usuario que está votando.");
            return;
        }
    
        const voteData = { votingUser, votedUser };
    
        // Realiza la solicitud para enviar el voto
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(voteData)
        })
            .then(response => {
                if (response.ok) {
                    // Deshabilitar todos los botones dentro de #userButtons
                    document.querySelectorAll("#userButtons .btn-general").forEach(button => {
                        button.disabled = true; // Deshabilita el botón
                        button.classList.add("disabled"); // Opcional: agrega una clase para efectos visuales
                    });
                } else {
                    return response.json().then(error => {
                        throw new Error(error.error || "Error al registrar el voto.");
                    });
                }
            })
            .catch(error => console.error("Error al enviar el voto:", error));
    }
    

    function fetchVoteResults() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/vote-results`)
            .then(response => response.json())
            .then(data => {
                const winner = data.winner;

                // Enviar el ganador al WebSocket para que todos los usuarios lo vean
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "votingResults",
                    winner: winner
                }));
            })
            .catch(error => console.error("Error al obtener los resultados de la votación:", error));
    }

    function displayResults(winner) {
        winnerName.textContent = `${winner}`;
        resultsSection.style.display = "block";
        showResultsButton.disabled = true;
    }

    function fetchNextQuestion() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/clear-votes`, { method: "POST" })
            .then(() => fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/next-quien-es-mas-probable?tipo=all`))
            .then(response => response.text())
            .then(data => {
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "newQuienEsMasProbableQuestion",
                    data: data
                }));
            })
            .catch(error => console.error("Error al obtener la siguiente pregunta:", error));
    }

    function fetchSessionDetails() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => response.json())
            .then(data => {
                const isCreator = data.creator === username;
                nextQuestionButton.style.display = isCreator ? "block" : "none";
                showResultsButton.style.display = isCreator ? "block" : "none";

                sessionStorage.setItem("users", JSON.stringify(data.users));
                if (isCreator) fetchNextQuestion();

                generateVotingButtons(data.users);
            })
            .catch(error => console.error("Error al obtener detalles de la sesión:", error));
    }
});

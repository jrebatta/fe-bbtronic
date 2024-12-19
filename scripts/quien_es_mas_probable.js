import API_BASE_URL from './ambiente.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');

    // Elementos principales
    const votingSection = document.getElementById("votingSection");
    const userButtons = document.getElementById("userButtons");
    const resultsSection = document.getElementById("resultsSection");
    const winnerName = document.getElementById("winnerName");
    const showResultsButton = document.getElementById("showResultsButton");
    const nextQuestionButton = document.getElementById("nextQuestionButton");
    const questionText = document.getElementById("questionText");

    // Configuración del WebSocket
    const socket = new SockJS(`${API_BASE_URL}/websocket`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/${sessionCode}`, (message) => {
            const parsedMessage = JSON.parse(message.body);
            if (parsedMessage.event === "newQuienEsMasProbableQuestion") {
                updateUI(parsedMessage.data);
            } else if (parsedMessage.event === "votingResults") {
                displayResults(parsedMessage.winner);
            }
        });

        fetchSessionDetails();
    });

    // Funciones principales
    function fetchSessionDetails() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}`)
            .then(response => response.json())
            .then(data => {
                const isCreator = data.creator === username;
                toggleCreatorControls(isCreator);
                sessionStorage.setItem("users", JSON.stringify(data.users));
                if (isCreator) fetchNextQuestion();
                generateVotingButtons(data.users);
            })
            .catch(console.error);
    }

    function toggleCreatorControls(isCreator) {
        nextQuestionButton.style.display = isCreator ? "block" : "none";
        showResultsButton.style.display = isCreator ? "block" : "none";
    }

    function updateUI(question) {
        questionText.textContent = question;
        resultsSection.style.display = "none";
        votingSection.style.display = "block";
        generateVotingButtons(JSON.parse(sessionStorage.getItem("users")) || []);
        showResultsButton.disabled = false;
    }

    function generateVotingButtons(users) {
        userButtons.innerHTML = "";
        users.forEach(user => {
            const button = document.createElement("button");
            button.classList.add("btn-general");
            button.textContent = user.username;
            button.onclick = () => sendVote(user.username);
            userButtons.appendChild(button);
        });
    }

    function sendVote(votedUser) {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ votingUser: username, votedUser })
        }).then(() => {
            document.querySelectorAll("#userButtons .btn-general").forEach(button => {
                button.disabled = true;
                button.classList.add("disabled");
            });
        }).catch(console.error);
    }

    function fetchVoteResults() {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/vote-results`)
            .then(response => response.json())
            .then(data => {
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "votingResults",
                    winner: data.winner
                }));
            })
            .catch(console.error);
    }

    function displayResults(winner) {
        winnerName.textContent = winner || "Empate";
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
                    data
                }));
            })
            .catch(console.error);
    }

    // Eventos de botones
    nextQuestionButton.addEventListener("click", fetchNextQuestion);
    showResultsButton.addEventListener("click", () => {
        fetch(`${API_BASE_URL}/api/game-sessions/${sessionCode}/check-all-voted`)
            .then(response => response.json())
            .then(data => {
                if (data.allVoted) fetchVoteResults();
                else alert("Aún no todos los usuarios han votado.");
            })
            .catch(console.error);
    });

    document.getElementById("logoutButton").addEventListener("click", () => {
        const sessionToken = sessionStorage.getItem("sessionToken");
        fetch(`${API_BASE_URL}/api/users/logout?sessionToken=${sessionToken}`, { method: "DELETE" })
            .then(() => {
                stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({
                    event: "userLeft",
                    username
                }));
                sessionStorage.clear();
                window.location.href = "/index.html";
            })
            .catch(console.error);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('sessionCode');
    const username = urlParams.get('username');
    const questionsContainer = document.getElementById("questionsContainer");
    const submitQuestionsButton = document.getElementById("submitQuestionsButton");
    const anonymousCheck = document.getElementById("anonymousCheck");
    const errorElement = document.getElementById("error");

    let questionsSent = false;

    const socket = new SockJS('https://be-bbtronic.onrender.com/websocket');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        stompClient.subscribe(`/topic/${sessionCode}`, function (message) {
            const parsedMessage = JSON.parse(message.body);
            if (parsedMessage.event === "allReady") {
                window.location.href = `mostrar_preguntas.html?sessionCode=${sessionCode}&username=${username}`;
            }
        });
    });

    function loadUsers() {
        fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}`)
            .then(response => response.json())
            .then(data => {
                data.users.forEach(user => {
                    if (user.username !== username) createQuestionInput(user.username);
                });
            })
            .catch(() => errorElement.textContent = "Error al cargar usuarios.");
    }

    function createQuestionInput(toUser) {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question-item");

        const label = document.createElement("label");
        label.textContent = `Pregunta para ${toUser}:`;

        const input = document.createElement("input");
        input.type = "text";
        input.dataset.toUser = toUser;

        questionDiv.appendChild(label);
        questionDiv.appendChild(input);
        questionsContainer.appendChild(questionDiv);
    }

    submitQuestionsButton.addEventListener("click", () => {
        if (questionsSent) return;
        questionsSent = true;

        const inputs = questionsContainer.querySelectorAll("input");
        let questionsReady = true;

        inputs.forEach(input => {
            const question = input.value.trim();
            if (!question) questionsReady = false;
            fetch(`https://be-bbtronic.onrender.com/api/game-sessions/${sessionCode}/send-question`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fromUser: username, toUser: input.dataset.toUser, question, anonymous: anonymousCheck.checked })
            });
        });

        if (questionsReady) setUserReady();
        else {
            questionsSent = false;
            errorElement.textContent = "Por favor, completa todas las preguntas.";
        }
    });

    function setUserReady() {
        fetch(`https://be-bbtronic.onrender.com/api/users/${username}/ready`, { method: "POST" })
            .then(() => stompClient.send(`/topic/${sessionCode}`, {}, JSON.stringify({ event: "allReady" })));
    }

    loadUsers();
});

let player1SecretNumber;
let player2SecretNumber;
let currentPlayerTurn;
let isGameOver = false;



function displayPlayerInfo() {
    const lobbyId = sessionStorage.getItem("lobbyId");
    const lobbyRef = firebase.database().ref('lobbies/' + lobbyId);


    lobbyRef.on('value', (snapshot) => {
        const lobbyData = snapshot.val();

        if (lobbyData) {
            //Player 1 Info
            const player1PhotoURL = lobbyData.p1Photo || "";
            const player1GameName = lobbyData.p1Name || "Player 1";
            var player1Wins = lobbyData.p1Wins || 0;
            var player1Losses = lobbyData.p1Losses || 0;
            document.getElementById('player1Info').innerHTML = `
                <h3>Player 1</h3>
                <img id="player1Photo" src="${player1PhotoURL}" alt="Player 1 Photo">
                <p id="player1Name">${player1GameName}</p>
                <p id="player1Wins">Wins: ${player1Wins}</p>
                <p id="player1Losses">Losses: ${player1Losses}</p>
            `;

            //Player 2 Info
            const player2PhotoURL = lobbyData.p2Photo || "";
            const player2GameName = lobbyData.p2Name || "Waiting for Player 2...";
            var player2Wins = lobbyData.p2Wins || 0;
            var player2Losses = lobbyData.p2Losses || 0;
            document.getElementById('player2Info').innerHTML = `
                <h3>Player 2</h3>
                <img id="player2Photo" src="${player2PhotoURL}" alt="Player 2 Photo">
                <p id="player2Name">${player2GameName}</p>
                <p id="player2Wins">Wins: ${player2Wins}</p>
                <p id="player2Losses">Losses: ${player2Losses}</p>
            `;
        }
    });

    startGame();
}

function startGame() {
    currentPlayerTurn = Math.random() < 0.5 ? 1 : 2;
    generateSecretNumbers();
    updateGameDisplay();
}

function generateSecretNumbers() {
    player1SecretNumber = Math.floor(Math.random() * 100) + 1;
    player2SecretNumber = Math.floor(Math.random() * 100) + 1;
    console.log("Player 1's secret number:", player1SecretNumber);
    console.log("Player 2's secret number:", player2SecretNumber);
}

function submitGuess(guess) {
    if (isGameOver) {
        return;
    }

    const currentGuess = parseInt(guess);
    if (isNaN(currentGuess)) {
        alert("Please enter a valid number");
        return;
    }

    if (currentPlayerTurn === 1) {
        checkGuess(currentGuess, player2SecretNumber, 1);
    } else {
        checkGuess(currentGuess, player1SecretNumber, 2);
    }

    currentPlayerTurn = 3 - currentPlayerTurn;
    updateGameDisplay();
}

function checkGuess(guess, secretNumber, guessingPlayer) {
    if (guess === secretNumber) {
        isGameOver = true;
        alert(`Player ${guessingPlayer} guessed correctly!`);
    } else if (guess < secretNumber) {
        alert("Too low")
    } else {
        alert("Too high")
    }
}

function updateGameDisplay() {
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.innerHTML = `<p>It's Player ${currentPlayerTurn}'s turn to guess.</p>`;
        if (isGameOver) {
            gameContainer.innerHTML += `<p>Game Over!</p>`;
        }
    }
}

displayPlayerInfo();
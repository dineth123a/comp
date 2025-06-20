let currentUserUid = sessionStorage.getItem("uid");
let lobbyId = sessionStorage.getItem("lobbyId");
const lobbyRef = firebase.database().ref('lobbies/' + lobbyId);
let myPlayerNumber = 0;
let isMyTurn = false;
let gtnTurns = 0;

/**Waits for the HTML content to fully load before calling the
 * functions displayPlayerInfo() and setupGameListener()
 **/
document.addEventListener('DOMContentLoaded', () => {
  displayPlayerInfo();
  setupGameListener();
});

/**
 * Loads & displays player info (names, photos, wins, losses) from database.
 * Determines whether the current user is Player 1 or Player 2 based on UID.
 * If player isn't in the lobby, they are redirected back to the lobby page.
 */
function displayPlayerInfo() {
  lobbyRef.on('value', (snapshot) => {
    const lobbyData = snapshot.val();

    //Checks if lobby data exists. If not, redirects to lobby page
    if (!lobbyData) {
      console.error("Lobby data not found or null. Redirecting to lobby list");
      window.location.href="/gtnLobby/gtnLobby.html";
      return;
    }

    if (currentUserUid === lobbyData.p1Uid) {
      myPlayerNumber = 1;
    } else if (currentUserUid === lobbyData.p2Uid) {
      myPlayerNumber = 2;
    } else {
      console.error("Invalid player UID");
      window.location.href = "/gtnLobby/gtnLobby.html";
      return;
    }

    //Player 1 Info
    document.getElementById('player1Info').innerHTML = `
    <h3>Player 1 (${lobbyData.p1Name || "Player 1"})</h3>
    <img id="player1Photo" src="${lobbyData.p1Photo || ""}" alt="Player 1 Photo">
    <p>Wins: ${lobbyData.p1Wins || 0}</p>
    <p>Losses: ${lobbyData.p1Losses || 0}</p>
    <p id="player1SecretNumberDisplay"</p>
    `;

    //Player 2 Info
    document.getElementById('player2Info').innerHTML = `
    <h3>Player 2 (${lobbyData.p2Name || "Waiting for player 2..."})</h3>
    <img id="player2Photo" src="${lobbyData.p2Photo || ""}" alt="Player 2 Photo">
    <p>Wins: ${lobbyData.p2Wins || 0}</p>
    <p>Losses: ${lobbyData.p2Losses || 0}</p>
    <p id="player2SecretNumberDisplay"></p>
    `;

    if (myPlayerNumber === 1 && lobbyData.p1SecretNumber) {
      document.getElementById('player1SecretNumberDisplay').innerText = `Your secret number: ${lobbyData.p1SecretNumber}`;
    } else if (myPlayerNumber === 2 && lobbyData.p2SecretNumber) {
      document.getElementById('player2SecretNumberDisplay').innerText = `Your secret number: ${lobbyData.p2SecretNumber}`;
    }
  });
}

/**
 * Sets up a real-time listener on the lobby to track game progress.
 * Initialises secret numbers if not set.
 * Randomly sets who takes the first turn.
 * Checks for game over and displays result.
 * Updates the user interface to show whose turn it is and the latest hint.
 */
function setupGameListener() {
  lobbyRef.on('value', (snapshot) => {
    const lobbyData = snapshot.val();
    if (!lobbyData) {
      window.location.href = "/gtnLobby/gtnLobby.html";
      return;
    }

    if (lobbyData.status === 'ready' &&
    (!lobbyData.p1SecretNumber || !lobbyData.p2SecretNumber)) {

      if (myPlayerNumber === 1 && (!lobbyData.p1SecretNumber || !lobbyData.p2SecretNumber)) {
        const updates = {};
          if (!lobbyData.p1SecretNumber) {
            updates.p1SecretNumber = Math.floor(Math.random() * 100) + 1;
          }
      if (!lobbyData.p2SecretNumber) {
        updates.p2SecretNumber = Math.floor(Math.random() * 100) + 1;
      }
      if (!lobbyData.currentPlayerTurn) {
        updates.currentPlayerTurn = Math.random() < 0.5 ? lobbyData.p1Uid : lobbyData.p2Uid;
      }

      lobbyRef.update(updates).catch(error => console.error("Init error:", error));
      }
    }

    if (lobbyData.status === 'gameOver') {
      document.getElementById('submitGuessBtn').disabled = true;
      document.getElementById('guessInput').disabled = true;

      const winnerId = lobbyData.winnerUid;
      const loserId = lobbyData.loserUid;
      let gameStatusMessage = '';

      if (winnerId === currentUserUid) {
        gameStatusMessage = 'You Won!';
          fb_saveScoreGTN(1);
      } else if (loserId === currentUserUid) {
        gameStatusMessage = 'You Lost!';
        fb_saveLossGTN(1);
      } else {
        gameStatusMessage = 'Game Over!';
      }
      document.getElementById('gameStatus').innerText = gameStatusMessage;
      document.getElementById('hintMessage').innerText = `Player 1's number was ${lobbyData.p1SecretNumber}, Player 2's number was ${lobbyData.p2SecretNumber}.`;
      return;
    }

    isMyTurn = (lobbyData.currentPlayerTurn === currentUserUid);
    document.getElementById('submitGuessBtn').disabled = !isMyTurn;
    document.getElementById('guessInput').disabled = !isMyTurn;

    updateGameDisplay(lobbyData);
  });
}

/**
 * Updates the user interface to show:
 *  - Whose turn it is.
 *  - The most recent guess and hint (Too high / Too low / Correct).
 */
function updateGameDisplay(lobbyData) {
  const gameStatusElement = document.getElementById('gameStatus');
  const hintMessageElement = document.getElementById('hintMessage');

  const currentPlayerName = (lobbyData.currentPlayerTurn === lobbyData.p1Uid) ? lobbyData.p1Name : lobbyData.p2Name;
  gameStatusElement.innerText = `It's ${currentPlayerName}'s turn to guess`;

  if (isMyTurn) {
    gameStatusElement.innerText += " (Your turn)";
  }

  if (lobbyData.lastGuessedBy && lobbyData.lastGuess && lobbyData.lastHint) {
    const guesserName = (lobbyData.lastGuessedBy === lobbyData.p1Uid) ? lobbyData.p1Name : lobbyData.p2Name;
    hintMessageElement.innerText = `${guesserName} guessed ${lobbyData.lastGuess}. Hint: ${lobbyData.lastHint}`;
  } else {
    hintMessageElement.innerText = '';
  }
}

/**
 * Called when the player clicks "Submit Guess" button.
 * Validates the guess, compares it to the opponent's secret number.
 * Updates the database with the guess, hint, and whose turn is next.
 * If the guess is correct, the game ends and win/loss counters are updated.
 */
function submitGuess() {
  if (!isMyTurn) {
    console.log("It's not your turn.");
    document.getElementById('hintMessage').innerText = "It's not your turn!";
    return;
  }

  const currentGuess = parseInt(guessInput.value);
  if (isNaN(currentGuess) || currentGuess < 1 || currentGuess > 100) {
    document.getElementById('hintMessage').innerText = "Please enter a valid number between 1 and 100";
    return;
  }

  gtnTurns++;
  console.log("Turns taken by current player: ", gtnTurns);
  
  lobbyRef.once('value').then(snapshot => {
    const data = snapshot.val();

      if (!data) {
        console.error("Lobby data missing during guess submission.");
        return;
      }

    const targetSecretNumber = myPlayerNumber === 1 ? data.p2SecretNumber : data.p1SecretNumber;
    const opponentUid = myPlayerNumber === 1 ? data.p2Uid : data.p1Uid;

    let hint = '';
    let gameOver = false;
    let winnerUid = '';
    let loserUid = '';

    if (currentGuess === targetSecretNumber) {
      hint = "Correct!";
      gameOver = true;
      winnerUid = currentUserUid;
      loserUid = opponentUid;
    } else if (currentGuess < targetSecretNumber) {
      hint = "Too low";
    } else {
      hint = "Too high";
    }

    const updates = {
      lastGuessedBy: currentUserUid,
      lastGuess: currentGuess,
      lastHint: hint,    
    };

    if (gameOver) {
      updates.status = 'gameOver';
      updates.winnerUid = winnerUid;
      updates.loserUid = loserUid;

      if (winnerUid === data.p1Uid) {
        updates.p1Wins = firebase.database.ServerValue.increment(1);
        updates.p2Losses = firebase.database.ServerValue.increment(1);
      } else {
        updates.p2Wins = firebase.database.ServerValue.increment(1);
        updates.p1Losses = firebase.database.ServerValue.increment(1);
      }
    } else {
      updates.currentPlayerTurn = opponentUid;
    }

    lobbyRef.update(updates)
    .then(() => {
      document.getElementById('guessInput').value ='';
    });
  }).catch(error => console.error("Error updating lobby:", error));
}

var input = document.getElementById("guessInput");
input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("submitGuessBtn").click();
  }
});
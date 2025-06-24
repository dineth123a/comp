let currentUserUid = sessionStorage.getItem("uid");
let lobbyId = sessionStorage.getItem("lobbyId");
const lobbyRef = firebase.database().ref('lobbies/' + lobbyId);
let myPlayerNumber = 0;
let isMyTurn = false;
let gtnTurns = 0;
let isRedirecting = false;

/**Waits for the HTML content to fully load before calling the
 * functions displayPlayerInfo() and setupGameListener()
 **/
document.addEventListener('DOMContentLoaded', () => {
  if (!lobbyId || !currentUserUid) {
    console.error("Missing lobbyId or currentUserUid. Redirecting to lobby");
    redirectToLobby();
    return;
  }
  displayPlayerInfo();
  setupGameListener();
});

function setupOnDisconnectForGame() {
    console.log("Setting up onDisconnect for game session...");

    lobbyRef.once('value').then(snapshot => {
        const lobbyData = snapshot.val();
        if (!lobbyData) {
            console.warn("Lobby data not found when setting up onDisconnect.");
            redirectToLobby();
            return;
        }

        let playerUid = null;
        if (currentUserUid === lobbyData.p1Uid) {
          playerUid = lobbyData.p1Uid;
        } else if (currentUserUid === lobbyData.p2Uid) {
          playerUid = lobbyData.p2Uid;
        }

        if (!playerUid) {
          console.warn("User is not recognised as P1 or P2 in this lobby. Cannot set onDisconnect");
            redirectToLobby();
            return;
        }

        const updatesOnDisconnect = {
            status: 'abandoned',
            gameEndedReason: `${myPlayerNumber === 1 ? 'Player 1' : 'Player 2'} disconnected`,
            currentPlayerTurn: null,
            lastGuessedBy: null,
            lastGuess: null,
            lastHint: null,
            p1SecretNumber: null,
            p2SecretNumber: null,
        };

        lobbyRef.onDisconnect().update(updatesOnDisconnect)
        .then(() => console.log(`onDisconnect for ${playerUid} set to abandon lobby lobby and clear game state`))
        .catch(error => console.error("Failed to set onDisconnect for player", error));
    }).catch(error => {
        console.error("Error setting up onDisconnect for game:", error);
    });
}

function redirectToLobby() {
  if (!isRedirecting) {
    isRedirecting = true;
    console.log("Redirecting to lobby page");
    sessionStorage.removeItem("lobbyId");
    lobbyRef.off();
    lobbyRef.onDisconnect().cancel().then(() => {
      console.log("onDisconnect cancelled before redirect");
      window.location.href = "/gtnLobby/gtnLobby.html";
    }).catch(error => {
      console.error("Error cancelling onDisconnect during redirect:", error);
      window.location.href = "/gtnLobby/gtnLobby.html";
    });
  }
}

/**
 * Loads & displays player info (names, photos, wins, losses) from database.
 * Determines whether the current user is Player 1 or Player 2 based on UID.
 * If player isn't in the lobby, they are redirected back to the lobby page.
 */
function displayPlayerInfo() {
  lobbyRef.once('value', (snapshot) => {
    const lobbyData = snapshot.val();

    //Checks if lobby data exists. If not, redirects to lobby page
    if (!lobbyData || lobbyData.status === 'abandoned') {
      console.error("Lobby data not found or null or abandoned. Redirecting to lobby list");
      redirectToLobby();
      return;
    }

    if (currentUserUid === lobbyData.p1Uid) {
      myPlayerNumber = 1;
    } else if (currentUserUid === lobbyData.p2Uid) {
      myPlayerNumber = 2;
    } else {
      console.error("Invalid player UID");
      redirectToLobby();
      return;
    }

    updatePlayerInfoDisplay(lobbyData);
    setupOnDisconnectForGame();
  });
}

function updatePlayerInfoDisplay(lobbyData) {
    //Player 1 Info
    document.getElementById('player1Info').innerHTML = `
    <h3>Player 1 (${lobbyData.p1Name || "Player 1"})</h3>
    <img id="player1Photo" src="${lobbyData.p1Photo || ""}" alt="Player 1 Photo">
    <p>Wins: ${lobbyData.p1Wins || 0}</p>
    <p>Losses: ${lobbyData.p1Losses || 0}</p>
    <p id="player1SecretNumberDisplay"></p>
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

    if (!lobbyData || lobbyData.status === 'abandoned') {
      console.log("Lobby data is null or deleted or abandoned. Redirecting to lobby");
      lobbyRef.off();
      redirectToLobby();
      return;
    }

    if (lobbyData.status === 'ready' && !lobbyData.p1SecretNumber && !lobbyData.p2SecretNumber) {
      console.log("Initialising game: setting secret numbers and first turns");
      lobbyRef.transaction(current => {
        if (!current || current.status !== 'ready' || current.p1SecretNumber || current.p2SecretNumber) {
          return;
        }
        current.p1SecretNumber = Math.floor(Math.random() * 100) + 1;
        current.p2SecretNumber = Math.floor(Math.random() * 100) + 1;
        current.currentPlayerTurn = Math.random() < 0.5 ? current.p1Uid : current.p2Uid;
        return current;
      }).then(() => {
        console.log("Game intialisation transaction complete.");
      }).catch(error => {
        console.error("Error during game initialisation transaction:", error);
    });
    return;
  }

    const opponentUid = myPlayerNumber === 1 ? lobbyData.p2Uid : lobbyData.p1Uid;
    if (lobbyData.status === 'ready' && (!opponentUid || lobbyData.status === 'abandoned')) {
      console.log("Opponent disconnected. Ending game.");
      if (lobbyData.status !== 'abandoned') {
        lobbyRef.update({
        status: 'abandoned',
        gameEndedReason: `Opponent disconnected`,
        currentPlayerTurn: null,
        lastGuessedBy: null,
        lastGuess: null,
        lastHint: null,
        p1SecretNumber: null,
        p2SecretNumber: null
      }).then(() => {
        document.getElementById("gameStatus").innerText = "Opponent disconnected. Game ended";
        document.getElementById("hintMessage").innerText = "Returning to lobby...";
        setTimeout(() => redirectToLobby(), 3000);
      }).catch(error => {
        console.error("Error updating lobby for disconnect:", error);
        redirectToLobby();
      });
    } else {
      document.getElementById("gameStatus").innerText = `Game ended ${lobbyData.gameEndedReason || 'Opponent left'}`;
      document.getElementById("hintMessage").innerText = "Returning to lobby...";
      setTimeout(() => redirectToLobby(), 3000);
    }
      return;
    }

    if (lobbyData.status === 'gameOver') {
      document.getElementById('submitGuessBtn').disabled = true;
      document.getElementById('guessInput').disabled = true;
      document.getElementById('guessInput').value = '';

      const winnerId = lobbyData.winnerUid;
      const loserId = lobbyData.loserUid;
      let gameStatusMessage = '';

      const scoreUpdatedFlag = sessionStorage.getItem(`gtn_score_updated_${lobbyId}`);
      if (!scoreUpdatedFlag) {
        if (winnerId === currentUserUid) {
          gameStatusMessage = 'You Won!';
          fb_saveScoreGTN(1);
          sessionStorage.setItem(`gtn_score_updated_${lobbyId}`, 'true');
      } else if (loserId === currentUserUid) {
        gameStatusMessage = 'You Lost!';
        fb_saveLossGTN(1);
        sessionStorage.setItem(`gtn_score_updated_${lobbyId}`, 'true');
      } else {
        gameStatusMessage = 'Game Over!';
      }
    } else {
      if (winnerId === currentUserUid) {
        gameStatusMessage = 'You Won!';
      } else if (loserId === currentUserUid) {
        gameStatusMessage = 'You Lost!';
      } else {
        gameStatusMessage = 'Game Over!';
      }
    }

      document.getElementById('gameStatus').innerText = gameStatusMessage;
      
      let opponentSecretNumber = 0;
      if (myPlayerNumber === 1) {
        // If I am Player 1, I was guessing Player 2's number
        opponentSecretNumber = lobbyData.p2SecretNumber;
      } else {
        // If I am Player 2, I was guessing Player 1's number
        opponentSecretNumber = lobbyData.p1SecretNumber;
      }
      document.getElementById('hintMessage').innerText = `The number was ${opponentSecretNumber}.`;
      document.querySelector('button[onclick="leaveGame()"]').style.display = 'block';
      lobbyRef.off();
      return;
    }

    isMyTurn = (lobbyData.currentPlayerTurn === currentUserUid);

    if (lobbyData.currentPlayerTurn) {
      document.getElementById('submitGuessBtn').disabled = !isMyTurn;
      document.getElementById('guessInput').disabled = !isMyTurn;
    } else {
      document.getElementById('submitGuessBtn').disabled = true;
      document.getElementById('guessInput').disabled = true;
      document.getElementById('gameStatus').innerText = "Waiting for game to start...";
    }

      updatePlayerInfoDisplay(lobbyData);
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

  const currentPlayerName = lobbyData.currentPlayerTurn ?
  (lobbyData.currentPlayerTurn === lobbyData.p1Uid ? lobbyData.p1Name : lobbyData.p2Name) :
  '';

  if (lobbyData.currentPlayerTurn) {
    if (isMyTurn) {
      gameStatusElement.innerText = "It's your turn to guess";
    } else {
      gameStatusElement.innerText = `It's ${currentPlayerName}'s turn to guess`;
    }
  } else {
    gameStatusElement.innerText = "Waiting for game to start...";
  }

  if (lobbyData.lastGuessedBy && lobbyData.lastGuess !== null && lobbyData.lastHint) {
    if (lobbyData.lastGuessedBy === currentUserUid) {
    hintMessageElement.innerText = `You guessed ${lobbyData.lastGuess}. Hint: ${lobbyData.lastHint}`;
    } else {
      const opponentName = (lobbyData.lastGuessedBy === lobbyData.p1Uid) ? lobbyData.p1Name : lobbyData.p2Name;
      hintMessageElement.innerText = `${opponentName} guessed ${lobbyData.lastGuess}. Hint: ${lobbyData.lastHint}`;
    }
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

  const guessInput = document.getElementById('guessInput');
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
        redirectToLobby();
        return;
      }

      if (data.status === 'gameOver' || data.status === 'abandoned') {
        console.log("Game is already over or abandoned. Cannot submit guess.");
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
      updates.gameEndedReason = 'Correct guess';

      if (winnerUid === data.p1Uid) {
        updates.p1Wins = (data.p1Wins || 0) + 1;
        updates.p2Losses = (data.p2Losses || 0) + 1;
      } else {
        updates.p2Wins = (data.p2Wins || 0) + 1;
        updates.p1Losses = (data.p1Losses || 0) + 1;
      }
    } else {
      updates.currentPlayerTurn = opponentUid;
    }

    lobbyRef.update(updates)
    .then(() => {
      guessInput.value = '';
    })
  .catch(error => console.error("Error updating lobby:", error));
});
}

function leaveGame() {
  console.log("Player leaving the game");

    lobbyRef.onDisconnect().cancel()
    .then(() => {
      console.log("Disconnect cancelled for current session");

    return lobbyRef.update({
      status: 'abandoned',
      gameEndedReason: `${myPlayerNumber === 1 ? 'Player 1' : 'Player 2'} left the game`,
      currentPlayerTurn: null,
      lastGuessedBy: null,
      lastGuess: null,
      lastHint: null,
      p1SecretNumber: null,
      p2SecretNumber: null,
  });
})
.then(() => {
    console.log("Lobby status updated to 'abandoned'. Redirecting");
    redirectToLobby();
  })
  .catch(error => {
    console.error("Error updating lobby status on leave:", error);
    redirectToLobby();
  });
}

var input = document.getElementById("guessInput");
if (input) {
input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("submitGuessBtn").click();
  }
});
}
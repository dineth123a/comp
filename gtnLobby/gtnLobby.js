/*-------------------------------------------------*/
// gtn_Lobby.js
/*-------------------------------------------------*/
console.log('%c gtnLobby.js', 'color: blue;');

var currentUserUid = sessionStorage.getItem("uid");
if (currentUserUid) {
    gtn_buildTableFunc();
} else {
    window.location.href = "../html/index.html";
    console.warn("User UID not found in session storage. Please log in.");
}

function gtn_buildTableFunc() {
    console.log('gtn_buildTableFunc: ');
    // Get table object
    var gtn_table = document.getElementById('tb_gtnLobby');
    console.log(gtn_table);

    var lobbiesRef = firebase.database().ref('lobbies');
    lobbiesRef.on('value', (snapshot) => {
        gtn_table.innerHTML = '';
        if (snapshot.exists()) {
            snapshot.forEach((lobbySnapshot) => {
                var lobby = lobbySnapshot.val();
                console.log("Lobby data:", lobby);

                if (lobby.status === 'waiting' && !lobby.p2Uid) {
                    var joinButton = `<button class='b_join' onclick='joinLobby("${lobbySnapshot.key}")'>JOIN</button>`;
                if (lobby.p1Uid === currentUserUid) {
                    joinButton = `<button class='b_join' disabled>JOIN</button>`;
                }
                var row = `
                        <tr>
                            <td>${lobby.p1Name || 'N/A'}</td>
                            <td>${lobby.p1Wins || 0}</td>
                            <td>${lobby.p1Losses || 0}</td>
                            <td>${joinButton}</td>
                            </tr>
                        `;
                gtn_table.innerHTML += row;
            }
            });
        } else {
            console.log('No lobbies found');
            const noLobbiesRow = `
            <tr>
            <td colespan="4">No active lobbies. Create one!</td>
            </tr>
            `;
            gtn_table.innerHTML = noLobbiesRow;
        }
    });
}

function createLobbyRecord() {
    var uid = sessionStorage.getItem("uid");
    var gameName = sessionStorage.getItem("gameName");
    var photoURL = sessionStorage.getItem("photoURL");

    sessionStorage.removeItem("lobbyId");
    const lobbyRef = firebase.database().ref('lobbies/' + uid);

    firebase.database().ref('lobbies/' + uid).once('value', (snapshot) => {
        if (snapshot.exists() && snapshot.val().status === 'waiting') {
            console.log("You already have an active lobby. Redirecting to game");
            sessionStorage.setItem("lobbyId", uid);
            window.location.href = "/gtn/gtn.html";
            return;
        }

        var lobbyData = {
            p1Uid: uid,
            p1Name: gameName,
            p1Photo: photoURL,
            p1Wins: 0,
            p1Losses: 0,
            p2Uid: "",
            p2Name: "",
            p2Photo: "",
            p2Wins: 0,
            p2Losses: 0,
            status: "waiting"
        };

        lobbyRef.onDisconnect().remove()
        .then(() => {
            console.log("onDisconnect for lobby creator set to remove lobby");
        }).catch(error => {
            console.error("Failed to set onDisconnect for lobby creator:", error);
        })

        lobbyRef.set(lobbyData)
            .then(() => {
                console.log("Lobby created with ID:", uid)
                sessionStorage.setItem("lobbyId", uid);
                document.getElementById("statusMessage").innerText = "Waiting for another player to join...";

                //Listen for player 2 joining
                lobbyRef.on("value", (snapshot) => {
                    const data = snapshot.val();
                    if (data && data.status === "ready") {
                        console.log("Player 2 joined. Heading to game");

                        lobbyRef.onDisconnect().cancel();
                        console.log("P1's initial onDisconnect in gtnLobby.js cancelled.");
                        lobbyRef.off();
                        window.location.href = "/gtn/gtn.html";
                    } else if (!data) {
                        console.log("Lobby no longer exists, perhaps creator disconnected");
                        document.getElementById("statusMessage").innerText = "Your lobby was removed (e.g. if you refreshed or disconnected). Create a new one.";
                        lobbyRef.off();
                    }
                });
            })
            .catch(error => {
                console.error("Error creating lobby:", error)
                document.getElementById("statusMessage").innerText = "Error creating lobby. Try again";
            });
    });
}

function joinLobby(lobbyId) {
    var joiningUserUid = sessionStorage.getItem("uid");
    var joiningGameName = sessionStorage.getItem("gameName");
    var joiningPhotoURL = sessionStorage.getItem("photoURL");

    sessionStorage.removeItem("lobbyId");

    if (lobbyId === joiningUserUid) {
        console.log("Cannot join your own lobby.");
        document.getElementById("statusMessage").innerText = "You cannot join your own lobby";
        return;
    }

    const lobbyRef = firebase.database().ref(`/lobbies/` + lobbyId);

    lobbyRef.once('value')
        .then((snapshot) => {
            const lobbyData = snapshot.val();
            if (lobbyData && lobbyData.status === 'waiting' && lobbyData.p2Uid === "") {
                var player2Update = {
                    p2Uid: joiningUserUid,
                    p2Name: joiningGameName,
                    p2Photo: joiningPhotoURL,
                    status: "ready"
                };

                lobbyRef.update(player2Update)
                    .then(() => {
                        console.log("Player joined lobby:", lobbyId);
                        sessionStorage.setItem("lobbyId", lobbyId);
                        lobbyRef.off();
                        window.location.href = "/gtn/gtn.html";
                    })
                    .catch(error => {
                        console.error("Error updating lobby:", error);
                        document.getElementById("statusMessage").innerText = "Error joining lobby";
                    });
            } else if (lobbyData && lobbyData.p1Uid === joiningUserUid && lobbyData.status !== 'gameOver' && lobbyData.status !== 'abandoned') {
                console.log("You are already P1 in this lobby. Heading to game");
                sessionStorage.setItem("lobbyId", lobbyId);
                lobbyRef.off();
                window.location.href = "/gtn/gtn.html";
            } else {
                console.log("Lobby is no longer available or is full.");
                document.getElementById("statusMessage").innerText = "Lobby is no longer available or is full.";
            }
        })
        .catch(error => {
            console.error("Error fetching lobby data:", error);
            document.getElementById("statusMessage").innerText = "Error fetching lobby data. Try again";
        });
}
/*-------------------------------------------------*/
// END OF CODE
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// gtn_Lobby.js
/*-------------------------------------------------*/
console.log('%c gtnLobby.js', 'color: blue;');

var currentUserUid = sessionStorage.getItem("uid");
gtn_buildTableFunc();

function gtn_buildTableFunc() {
    console.log('gtn_buildTableFunc: ');
    // Get table object
    var gtn_table = document.getElementById('tb_gtnLobby');
    console.log(gtn_table);

    var lobbiesRef = firebase.database().ref('lobbies');
    lobbiesRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
            gtn_table.innerHTML = '';

            snapshot.forEach((lobbySnapshot) => {
                var lobby = lobbySnapshot.val();
                console.log(lobby);

                var joinButton = `<button class='b_join' onclick='joinLobby("${lobbySnapshot.key}")'>JOIN</button>`;
                if (lobby.p1Uid === currentUserUid || lobby.status === 'ready') {
                    joinButton = `<button class='b_join' disabled>JOIN</button>`;
                }
                    var row = `
                        <tr>
                            <td>${lobby.p1Name || 'N/A'}</td>
                            <td>${lobby.p1Wins || 0}</td>
                            <td>${lobby.p1Losses || 0}</td>
                            <td>${joinButton}</td>
                            </tr>
                        `
                    gtn_table.innerHTML += row;
            });
        } else {
            console.log('No lobbies found');
        }
    });
}

function createLobbyRecord() {
var uid = sessionStorage.getItem("uid");
var gameName = sessionStorage.getItem("gameName");
var photoURL = sessionStorage.getItem("photoURL");

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

const lobbyRef = firebase.database().ref('/lobbies/' + uid);

lobbyRef.set(lobbyData)
.then(() => {
    console.log("Lobby created with ID:", uid)
    sessionStorage.setItem("lobbyId", uid);
    document.getElementById("statusMessage").innerText = "Waiting for another player to join...";

    //Listen for player 2 joining
    lobbyRef.on("value", (snapshot) => {
        const data = snapshot.val();
        if (data && data.status === "ready") {
            window.location.href = "/gtn/gtn.html";
        }
    });
})
.catch(error => {
    console.error("Error creating lobby:", error)
});
}

function joinLobby(lobbyId) {
var joiningUserUid = sessionStorage.getItem("uid");
var joiningGameName = sessionStorage.getItem("gameName");
var joiningPhotoURL = sessionStorage.getItem("photoURL");

if (lobbyId === joiningUserUid) {
    console.log("Cannot join your own lobby.");
    return;
}

const lobbyRef = firebase.database().ref(`/lobbies/` + lobbyId);

lobbyRef.once('value')
.then((snapshot) => {
    const lobbyData = snapshot.val();
    if (lobbyData && lobbyData.status === 'waiting') {
        var player2Update = {
            p2Uid: joiningUserUid,
            p2Name: joiningGameName,
            p2Photo: joiningPhotoURL,
            p2Wins: 0,
            p2Losses: 0,
            status: "ready"
        };

        lobbyRef.update(player2Update)
            .then(() => {
                console.log("Player joined lobby:", lobbyId);
                sessionStorage.setItem("lobbyId", lobbyId);
                window.location.href = "/gtn/gtn.html";
            })
            .catch(error => {
                console.error("Error joining lobby:", error);
            });
        } else {
            console.log("Lobby is no longer available or is full.");
            document.getElementById("statusMessage").innerText = "Lobby is no longer available or is full.";
        }
    })
    .catch(error => {
        console.error("Error fetching lobby data:", error);
    })
}
/*-------------------------------------------------*/
// END OF CODE
/*-------------------------------------------------*/
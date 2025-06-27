console.log('%c fb_io.js \n-----------', 'color: blue; background-color: white;');
/**
 * When the "Login/Signup" button is clicked, index.html calls fb_login()
 * Attempts to log in the user using Firebase Authentication.
 * If already logged in, fetches user registration details via fb_getRegistration
 * If not logged in, prompts Google sign-in.

 */
function fb_login() {
  console.log("logging in to site")
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      sessionStorage.setItem("uid", user.uid);
      sessionStorage.setItem("photoURL", user.photoURL);
      //Logged in
      console.log("logged in to site")
      console.log(user)
      fb_getRegistration(user); // Check if the user is registered
    } else {
      //Not logged in
      console.log("not logged in ")
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
        var user = result.user;
        fb_getRegistration(user);
      });
    }
  });
}

/**
 * fb_getRegistration gets called by fb_login after the user has clicked the login/signup button
 * Fetches user registration data from database via fb_checkRegistration()
 */
function fb_getRegistration(user) {
  console.log("checking if " + user.uid + " is registered")
  firebase.database().ref('userDetails/' + user.uid).once('value', (snapshot) => {
    fb_checkRegistration(snapshot, user)
  });
}

/**
 * Gets called by fb_get Registration()
 * Checks if the user is registered in the database.
 * If there is no record of the user in the database, the user is redirected to registration.html
 * If there is a record of the user in the database, the user is redirected to gameMenu.html
 */
function fb_checkRegistration(snapshot, user) {
const repo = "comp";
const isGithub = window.location.hostname.includes("github.io");
const base = isGithub ? `/${repo}/` : "/";
  console.log(snapshot.val())
  if (snapshot.val() == null) {
    console.log("the user is not registered in the data base. Please go to the register page.")
    console.log("being redirected to registration page.")
    window.location = base + "html/registration.html"
    console.log("You have been redirected to the registration page.")
  } else {
    console.log("the user is registered in the database. Please contintue to game page!");

    const userInfo = snapshot.val();
    sessionStorage.setItem("uid", user.uid);
    sessionStorage.setItem("displayName", userInfo.displayName || "");
    sessionStorage.setItem("email", userInfo.email || "");
    sessionStorage.setItem("photo", userInfo.photo || user.photoURL || "");
    sessionStorage.setItem("gameName", userInfo.gameName || "");
    sessionStorage.setItem("age", userInfo.age || "");
    sessionStorage.setItem("phoneNumber", userInfo.phoneNumber || "");
    sessionStorage.setItem("gender", userInfo.gender || "");
    sessionStorage.setItem("addressNumber", userInfo.addressNumber || "");
    sessionStorage.setItem("street", userInfo.street || "");
    sessionStorage.setItem("suburb", userInfo.suburb || "");
    sessionStorage.setItem("city", userInfo.city || "");

    initializeAuthAndNav();
    
    console.log("session storage updated with user info:", userInfo);
    console.log("being redirected to game menu page.")
    window.location = base + "html/gameMenu.html";
    console.log("You have been redirected to the game page.")
  }
}

/**
 * Gets called by fb_readUserDetailsAdmin(), fb_readUserRocketRushScoresAdmin(), fb_readUserGeoDashScoresAdmin
 * Logs the errors to the console
 */
function fb_error(error) {
  console.error("error");
  console.error(error)
}

/**
 * fb_register() gets called by registration.js
 * If signed in, proceeds with storing user information via fb_userInfo
 * If user is not signed in, it signs user in via google authentication & stores user info via fb_userInfo
 */
function fb_register() {
  console.log("fb_register called")
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in:
      console.log("user is signed in:", user);
      fb_userInfo(user);
    } else {
      console.log("User is not signed in. Initiating Google sign-in.");
      // User is not signed in - Use the Google!
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log("Google sign-in successful:", user);
        fb_userInfo(user);
      }).catch(function(error) {
        console.error("Error during Google sign-in:", error);
      })
    }
  });
}

/**
 * Gets called by fb_register
 * Stores user information in database under the 'userDetails' node for the authenticated user
 * Initialises highscores for RocketRush, GeoDash, and GTN games.
 * Updates session storage with user details
 * Calls the function fb_goToGP to redirect user to the game menu
 */
function fb_userInfo(user) {
  console.log("fb_userInfo called with user:", user);
  const userName = document.getElementById("HTML_name").value;
  const userAge = document.getElementById("HTML_age").value;
  const phoneNumber = document.getElementById("HTML_phoneNumber").value;
  const street = document.getElementById("HTML_street").value;
  const suburb = document.getElementById("HTML_suburb").value;
  const city = document.getElementById("HTML_city").value;
  const postcode = document.getElementById("HTML_postcode").value;

  let gender;
  const genderRatios = document.getElementsByName('gender');
  for (let i = 0; i < genderRatios.length; i++) {
    if (genderRatios[i].checked) {
      gender = genderRatios[i].value;
      break;
    }
  }

  var data = {
    gameName: userName,
    displayName: user.displayName,
    email: user.email,
    photo: user.photoURL,
    age: userAge,
    phoneNumber: phoneNumber,
    gender: gender,
    street: street,
    suburb: suburb,
    city: city,
    postcode: postcode,
  }
    sessionStorage.setItem("gameName", HTML_name.value)
    sessionStorage.setItem("displayName", user.displayName)
    sessionStorage.setItem("email", user.email)
    sessionStorage.setItem("photo", user.photoURL)
    sessionStorage.setItem("age", HTML_age.value)
    sessionStorage.setItem("uid", user.uid)
    sessionStorage.setItem("phoneNumber", phoneNumber);
    sessionStorage.setItem("gender", gender);
    sessionStorage.setItem("street", street);
    sessionStorage.setItem("suburb", suburb);
    sessionStorage.setItem("city", city);
    sessionStorage.setItem("postcode", postcode);

  console.log(user.uid)
  console.log(data)
  firebase.database().ref('/highscores/rocketRush/' + userName).set({
    uid: user.uid,
    score: 0
  });
  firebase.database().ref('/highscores/geoDash/' + userName).set({
    uid: user.uid,
    score: 0
  })

    firebase.database().ref('/highscores/gtn/' + userName).set({
    uid: user.uid,
    totalWins: 0,
    totalLosses: 0
  })

  firebase.database().ref('/userDetails/' + user.uid).set(data).then(fb_goToGP)
}

/**
 * Gets called by fb_userInfo
 * Redirects the user to the gameMenu page after registration
 */
function fb_goToGP() {
  console.log("fb_goToGP called")
  window.location = "gameMenu.html";
}

/**
 * Gets called in the endScreen() function in RocketRush.js
 * If user is signed in, save the Rocket Rush score for the authenticated user.
 * Only updates if new score is higher than the current score in database
 * If user is not signed in, redirect to index.html. Sign user in and then save high score.
 */
function fb_saveScoreRocketRush(score) {
  var gameName = sessionStorage.getItem("gameName");
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in:
      var scoreRef = firebase.database().ref('highscores/rocketRush/' + gameName);
      scoreRef.once('value', (snapshot) => {
        var currentHighScore = (snapshot.val() && snapshot.val().score) || 0; 
        if (score > currentHighScore) {
          console.log(user.uid);
          console.log("saving " + score);
          scoreRef.set({
            uid: user.uid,
            score: score
          });
        }
      });
    } else {
      window.location = "html/index.html";
      // User is not signed in - Use the Google!
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // The signed-in user info.
        var user = result.user;
        console.log("saving score for RocketRush: " + score)
        var scoreRef = firebase.database().ref('highscores/rocketRush/' + gameName);
        scoreRef.once('value', (snapshot) => {
          var currentHighScore = (snapshot.val() && snapshot.val().score) || 0;
          if (score > currentHighScore) {
            scoreRef.set({
              uid: user.uid,
              score: score
            });
          }
        });
      });
    }
  });
}

/**
 * Gets called by the youDead() function in GeoDash.js
 * If user is signed in, save the GeoDash score for the authenticated user.
 * Only updates if new score is higher than the current score in database
 * If user is not signed in, redirect to index.html. Sign user in and then save high score.
 */
function fb_saveScoreGeoDash(score) {
  var gameName = sessionStorage.getItem("gameName");
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in:
      console.log(user.uid)
      console.log("saving " + score);
      var scoreRef = firebase.database().ref('highscores/geoDash/' + gameName);
      scoreRef.once('value', (snapshot) => {
        var currentHighScore = (snapshot.val() && snapshot.val().score) || 0;
        if (score > currentHighScore) {
          scoreRef.set({
            uid: user.uid,
            score: score
          });
        }
      });
    } else {
      window.location = "html/index.html";
      // User is not signed in - Use the Google!
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // The signed-in user info.
        var user = result.user;
        console.log("saving score for GeoDash: " + score);
        var scoreRef = firebase.database().ref('highscores/geoDash/' + gameName);
        scoreRef.once('value', (snapshot) => {
          var currentHighScore = (snapshot.val() && snapshot.val().score) || 0;
          if (score > currentHighScore) {
            scoreRef.set({
              uid: user.uid,
              score: score
            });
          }
        });
      });
    }
  });
}

/**
 * Updates the total wins for the authenticated user in GTN game
 * Retireves current win/loss record from database, then increments by specified amount,
 * and then updates record in database
 * If user is not signed in, they are redirected to the index page
 */
function fb_saveScoreGTN(winAmount) {
  var gameName = sessionStorage.getItem("gameName");
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log(user.uid);
      var scoreRef = firebase.database().ref('highscores/gtn/' + gameName);
      scoreRef.once('value', (snapshot) => {
      var existingTotalWins = (snapshot.val() && snapshot.val().totalWins) || 0;
      var existingTotalLosses = (snapshot.val() && snapshot.val().totalLosses) || 0;
      const newTotalWins = existingTotalWins + winAmount;
      console.log(`updating total wins for ${gameName}`);
          scoreRef.set({
            uid: user.uid,
            wins: newTotalWins,
            losses: existingLosses
          });
      });
    } else {
      // User is not signed in.
      window.location = "html/index.html";
    }
  });
}

/**
 * Updates the total losses for the authenticated user in GTN game
 * Retireves current win/loss record from database, then increments by specified amount,
 * and then updates record in database
 * If user is not signed in, they are redirected to the index page
 */
function fb_saveLossGTN(lossAmount) {
    var gameName = sessionStorage.getItem("gameName");
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var scoreRef = firebase.database().ref('highscores/gtn/' + gameName);
            scoreRef.once('value', (snapshot) => {
                var existingTotalWins = (snapshot.val() && snapshot.val().totalWins) || 0;
                var existingTotalLosses = (snapshot.val() && snapshot.val().totalLosses) || 0;

                var newTotalLosses = existingTotalLosses + lossAmount;

                console.log(`Updating GTN global losses for ${gameName}: from ${existingLosses} to ${newTotalLosses}`);
                scoreRef.set({
                    uid: user.uid,
                    wins: existingTotalWins,
                    losses: newTotalLosses
                });
            });
        } else {
            // User is not signed in.
            window.location = "html/index.html";
        }
    });
}


/**
 * Gets called by the ad_user function in ad_manager.js
 * Fetches all user data (for admin purposes)
 * Calls fb_readUserDetailsOk function
 * In case of error, it calls fb_error function
 */
function fb_readUserDetailsAdmin() {
  firebase.database().ref('userDetails').on('value', fb_readUserDetailsOk, fb_error)
  }

/**
 * Gets called by the fb_readUserDetailsAdmin function
 * Is called upon successful data retrieval of user details for admin purposes
 * Processes user data read by an admin via ad_processUSERReadAll
 */
  function fb_readUserDetailsOk(_snapshot) {
    ad_processUSERReadAll('OK', null, _snapshot, null, null)
  }

  /**
   * Gets called by ad_SI function in ad_manager.js
   * mainly used for administrative purposes to monitor and retrieve all Rocket Rush highscores
   * Listens for changes to the 'users' reference in the database and calls fb_readRocketRushScoresOk on success, fb_error on failure
   */
  function fb_readUserRocketRushScoresAdmin() {
    firebase.database().ref('highscores/rocketRush').on('value', fb_readRocketRushScoresOk, fb_error)
    }

  /**
   * Gets called by fb_readUserRocketRushScoresAdmin
   * Called upon successful retrieval of Rocket Rush scores for admin purposes
   * Processes the data returned in _snapshot by passing it to the ad_processBBReadAll for further handling
   */
    function fb_readRocketRushScoresOk(_snapshot) {
      ad_processBBReadAll('OK', null, _snapshot, null, null)
    }

  /**
   * Gets called by ad_BB function in ad_manager.js
   * mainly used for adminstrative purposes to monitor and retrieve all Geo Dash highscores
   * Listens for changes to the 'users' reference in the database and calls fb_readGeoDashScoresOk on success, fb_error on failure
   */
    function fb_readUserGeoDashScoresAdmin() {
      firebase.database().ref('highscores/geoDash').on('value', fb_readGeoDashScoresOk, fb_error)
      }
    
  /**
   * Gets called by fb_readUserGeoDashScoresAdmin
   * Called upon successful retrieval of Geo Dash scores for admin purposes
   * Processes the data returned in _snapshot by passing it to the ad_processSIReadAll for further handling
   */
      function fb_readGeoDashScoresOk(_snapshot) {
        ad_processSIReadAll('OK', null, _snapshot, null, null)
      }
      
        /**
   * Gets called by ad_GTN function in ad_manager.js
   * mainly used for administrative purposes to monitor and retrieve all GTN scores
   * Listens for changes to the 'highscores/gtn' reference in the database and calls fb_readGTNScoresOk on success, fb_error on failure
   */
    function fb_readUserGTNScoresAdmin() {
      firebase.database().ref('highscores/gtn').on('value', fb_readGTNScoresOk, fb_error)
    }

  /**
   * Gets called by fb_readUserGTNScoresAdmin
   * Called upon successful retrieval of GTN scores for admin purposes
   * Processes the data returned in _snapshot by passing it to the ad_processGTNReadAll for further handling
   */
    function fb_readGTNScoresOk(_snapshot) {
      ad_processGTNReadAll('OK', null, _snapshot, null, null)
    }
/**
 * Gets called by the updateLeaderboard() function
 * This function reads the top 5 Rocket Rush scores from the database
 * If signed in, fetches top 5 Rocket Rush scores from Firebase.
 * If not signed in, redirects to index.html ands signs in user via google authentication 
 */
function fb_readRocketRushScores(readScores) {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      firebase.database().ref('highscores/rocketRush/').orderByChild('/score')
              .startAt(1).limitToLast(5).once('value', fb_displayRocketRushTable)
    } else {
      window.location = "../../html/index.html";
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
      });
    }
  });
}

/**
 * Gets called by the updateLeaderboard() function
 * This function reads the top 5 Geo Dash scores from the database
 * If signed in, fetches top 5 GeoDash scores from Firebase.
 * If not signed in, redirects to index.html ands signs in user via google authentication 
 */
function fb_readGeoDashScores(readScores) {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      firebase.database().ref('highscores/geoDash/').orderByChild('/score').startAt(1).limitToLast(5).once('value', fb_displayGeoDashTable)
    } else {
      window.location = "../../html/index.html";
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
      });
    }
  });
}

/**
 * Gets called by updateLeaderboard() function
 * Reads Guess The Number (GTN) scores from the database
 * If user is signed in, it fetches the GTN scores,
 * and then calls fb_displayGTNTable function to display the scores
 * If user is not signed in, it redirects to landing page (index.html)
 */
function fb_readGTNScores(readScores) {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      firebase.database().ref('highscores/gtn/').orderByChild('wins').once('value', fb_displayGTNTable)
    } else {
      window.location = "../../html/index.html";
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
      });
    }
  });
}

/**
 * Gets called from leaderboard.html
 * Updates the leaderboard by fetching the scores for all games,
 * by calling their data retrieval function
 */
function updateLeaderboard() {
  fb_readRocketRushScores();
  fb_readGeoDashScores();
  fb_readGTNScores();
}

/**
 * Gets called by fb_readRocketRushScores() function
 * If the user has a Rocket Rush score in database, present it in the table
 * If user doesn't have Rocket Rush score in DB, set "No scores available" in table
 * Displays top 5 highscores for Rocket Rush
 */
function fb_displayRocketRushTable(snapshot) {
  var table = document.getElementById("container");
  var rank = 0;
  if (!snapshot.exists()) {
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.colSpan = 2;
    cell.innerHTML = "No scores available";
    return;
  }
  snapshot.forEach(child => {
    let userRecord = child.val();
    if (userRecord.score > 0) {
      var row = table.insertRow(0);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      cell1.innerHTML = child.key;
      cell2.innerHTML = userRecord.score;
      rank++;
      if (rank >= 5) return true;
    }
  });
  if (rank === 0) {
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.colSpan = 2;
    cell.innerHTML = "No scores available";
  }
}

/**
 * Gets called by fb_readGeoDashScores() function
 * If the user has a GeoDash score in database, present it in the table
 * If user doesn't have a GeoDash score in database, present "No scores available" in the table
 * Displays top 5 highscores for GeoDash
 */
function fb_displayGeoDashTable(snapshot) {
  var table1 = document.getElementById("container2");
  if (!snapshot.exists()) {
    var row = table1.insertRow(0);
    var cell = row.insertCell(0);
    cell.colSpan = 2;
    cell.innerHTML = "No scores available";
    return;
  }
  var rank = 0;
  snapshot.forEach(child => {
    let userRecord = child.val();
    if (userRecord.score > 0) {
      var row = table1.insertRow(0);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      cell1.innerHTML = child.key;
      cell2.innerHTML = userRecord.score;
      rank++;
      if (rank >= 5) return true;
    }
  });
  if (rank === 0) {
    var row = table1.insertRow(0);
    var cell = row.insertCell(0);
    cell.colSpan = 2;
    cell.innerHTML = "No scores available";
  }
}


/**
 * Gets called by fb_readGTNScores() function
 * If the user has a GTN score record in database, present it in the table
 * If user doesn't have a GTN score record in database, present "No scores available" in the table
 * Displays top 5 players for GTN based on wins
 */
function fb_displayGTNTable(snapshot) {
  var table = document.getElementById("container3");
  if (!table) {
    console.error("GTN Leaderboard table element not found (ID: container3).");
    return;
  }
  if (!snapshot.exists()) {
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.colSpan = 2;
    cell.innerHTML = "No scores available";
    return;
  }

  let scoresArray = [];
  snapshot.forEach(child => {
    let userRecord = child.val();
    if (userRecord.wins !== undefined && userRecord.wins !== null) {
      scoresArray.push({
        gameName: child.key,
        wins: userRecord.wins,
        losses: userRecord.losses
      });
    }
  });

  scoresArray.sort((a, b) => b.wins - a.wins);

  var rank = 0;
  for (let i = 0; i < scoresArray.length && rank < 5; i++) {
    let record = scoresArray[i];
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = record.gameName;
    cell2.innerHTML = record.wins;
    cell3.innerHTML = record.losses;
    rank++;
  }

  if (rank === 0) {
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.colSpan = 2;
    cell.innerHTML = "No scores available";
  }
}

/**
 * Controls the visibility of admin link navigation bar based on user's authenctication status,
 * registration in 'userDetails' , and whether they have adminAccess
 * If user is registered and is an admin, they can see the admin page link in navbar
 * If not, users can't see admin page link in navbar
 */
function initializeAuthAndNav() {
  // Get the admin link element by its ID
  const adminLink = document.getElementById('adminLink');

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in
      const userId = user.uid;
      const userDetailsRef = firebase.database().ref('userDetails/' + userId);
      // Reference to the user's admin status in the 'adminAccess' path
      const adminAccessRef = firebase.database().ref('adminAccess/' + userId + '/isAdmin');

      // First, check if the user is registered in 'userDetails'
      userDetailsRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
          console.log('User is registered:', snapshot.val());

          // User is registered, now check their admin status
          adminAccessRef.once('value').then((adminSnapshot) => {
            if (adminSnapshot.exists() && adminSnapshot.val() === true) {
              console.log('User is an admin. Showing admin link.');
              // Only try to show the link if it exists on the page
              if (adminLink) {
                adminLink.style.display = 'block'; // Show the Admin link
              }
            } else {
              console.log('User is not an admin or admin status not found. Hiding admin link.');
              // Always ensure the link is hidden for non-admins
              if (adminLink) {
                adminLink.style.display = 'none';
              }
            }
          }).catch((error) => {
            console.error("Error checking admin status:", error);
            // Hide admin link on error
            if (adminLink) {
              adminLink.style.display = 'none';
            }
          });

        } else {
          // User is authenticated but not registered in 'userDetails', redirect to registration
          console.log('User not registered in userDetails, redirecting to registration.html');
          // Use a consistent absolute path if your HTML files are in different subdirectories
          window.location.href = '/html/registration.html';
        }
      }).catch((error) => {
        console.error("Error checking userDetails:", error);
        // Redirect to registration on any error during userDetails check
        window.location.href = '/html/registration.html';
      });

    } else {
      // No user is signed in, redirect to registration page
      console.log('No user signed in, redirecting to registration.html');
      window.location.href = '/html/registration.html';
      // Hide admin link if no user is signed in
      if (adminLink) {
        adminLink.style.display = 'none';
      }
    }
  });
}

/**
 * Opens the side navigation bar.
 * and shifts main content area to the right
 */
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  // The 'main' content area should shift to the right when the nav opens
  document.getElementById("main").style.marginLeft = "250px";
}

/**
 * Closes the side navigation bar.
 * and returns the main content area to its original position
 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  // The 'main' content area should return to its original position
  document.getElementById("main").style.marginLeft = "0";
}
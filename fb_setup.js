console.log('%c fb_setup.js \n-----------',
  'color: blue; background-color: white;');

var database;

/**************************************************************/
// fb_initialise()
// Initialize firebase, connect to the Firebase project.
// 
// Find the config data in the Firebase consol. Cog wheel > Project Settings > General > Your Apps > SDK setup and configuration > Config
//
// Input:  n/a
// Return: n/a
/**************************************************************/
function fb_initialise() {
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDI82mqxbd_dCvqJeJ2ol_9EAzB4cYAbYQ",
  authDomain: "comp-2025-dineth-abayarathna.firebaseapp.com",
  projectId: "comp-2025-dineth-abayarathna",
  storageBucket: "comp-2025-dineth-abayarathna.firebasestorage.app",
  messagingSenderId: "739489205584",
  appId: "1:739489205584:web:d5ccdd8cdb1e8308973055",
  measurementId: "G-JX282QXCYJ"
};

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // This log prints the firebase object to the console to show that it is working.
  // As soon as you have the script working, delete this log.
  console.log(firebase);
}
fb_initialise();
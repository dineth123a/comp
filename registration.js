console.log('%c registration.js \n-----------',
  'color: blue; background-color: white;');

document.addEventListener("DOMContentLoaded", function() {
  const MINAGE = 3;
  const MAXAGE = 100;

  document.getElementById("registrationForm").addEventListener("submit", function(event) {
    event.preventDefault();
    if (validateForm()) {
      fb_register();
    }
  });

  function validateForm() {
    console.log("validate form called");
    var userName = document.getElementById("HTML_name").value.trim();
    var userAge = document.getElementById("HTML_age").value.trim();

    console.log("Name:", userName);
    console.log("Age:", userAge);

    if (/\d/.test(userName) || userName.trim() === "") {
      alert("Please enter a valid name that does not contain numbers or is blank");
      console.log("name validation failed");
      return false;
    }

    if (userAge < MINAGE || userAge > MAXAGE || userAge.trim() === "" || isNaN(userAge)) {
      alert("Please enter a valid age that is between " + MINAGE + " and " + MAXAGE + ".");
      console.log("age validation failed");
      return false;
    }

    console.log("Validation passed");
    return true;
  }
});
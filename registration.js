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

  function validateForm(gender) {
    console.log("validate form called");
    var userName = document.getElementById("HTML_name").value.trim();
    var userAge = document.getElementById("HTML_age").value.trim();
    var phoneNumber = document.getElementById("HTML_phoneNumber").value.trim();
    var street = document.getElementById("HTML_street").value.trim();
    var suburb = document.getElementById("HTML_suburb").value.trim();
    var city = document.getElementById("HTML_city").value.trim();
    var postcode = document.getElementById("HTML_postcode").value.trim();

    console.log("Name:", userName);
    console.log("Age:", userAge);
    console.log("Phone Number:", phoneNumber);;
    console.log("Gender", gender);
    console.log("Street:", street);
    console.log("Suburb:", suburb);
    console.log("City:", city);
    console.log("Postcode:", postcode);

    if (/\d/.test(userName) || userName === "") {
      alert("Please enter a valid name that does not contain numbers or is blank");
      console.log("name validation failed");
      return false;
    }

    if (userAge < MINAGE || userAge > MAXAGE || userAge === "" || isNaN(userAge)) {
      alert("Please enter a valid age that is between " + MINAGE + " and " + MAXAGE + ".");
      console.log("age validation failed");
      return false;
    }

    if (phoneNumber === "") {
      alert("Please enter a valid phone number (digits only and not blank).");
      console.log("phone number validation failed");
      return false;
    }

    if (street === "") {
      alert("Please enter a valid street (cannot be blank).");
      console.log("street validation failed");
      return false;
    }

    if (suburb === "") {
      alert("Please enter a valid suburb (cannot be blank).");
      console.log("suburb validation failed");
      return false;
    }

    if (city === "") {
      alert("Please enter a valid city (cannot be blank).");
      console.log("city validation failed");
      return false;
    }

        if (postcode === "") {
      alert("Please enter a valid postcode (cannot be blank).");
      console.log("postcode validation failed");
      return false;
    }

    if (gender === "" ) {
      alert("Please select your gender.");
      console.log("gender validation failed");
      return false;
    }

    console.log("Validation passed");
    return true;
  }
});

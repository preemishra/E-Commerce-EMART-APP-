// Function to check the string contains alphabet only with one space allowed and string should not be empty
export let containsAlphabets = (field) => {
  return /^[a-zA-Z ]*$/.test(field);
};

// Function to validate the email
export let validateEmail = (mail) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  return false;
};

// Function to validate the phone number
export let validatePhoneNumber = (field) => {
  var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  return regex.test(field);
};

// Function to validate the zip code
export let isZipNumber = (zip) => {
  if (isNaN(zip)) {
    return false;
  }
  if (zip.toString().length !== 6) {
    return false;
  }
  return true;
};

// Function to validate the password
export let checkPassword = (password) => {
  if (
    password.length < 8 ||
    password.length > 50 ||
    password.search(/\d/) == -1 ||
    password.search(/[a-zA-Z]/) == -1 ||
    password.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) != -1
  ) {
    return false;
  } else {
    return true;
  }
};

//Function to extract the current date to set the limit in Date
export let extractCurrentDateValidation = () => {
  let today = new Date();
  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate());
  let extractedDate = yesterday.toISOString().split("T")[0];
  return extractedDate;
};

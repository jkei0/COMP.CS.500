/**
 * TODO: 8.3 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

const form = document.getElementById("register-form");
const inputName = document.getElementById("name");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const inputPasswordConfirmation = document.getElementById("passwordConfirmation");

form.onsubmit = (event) => {
  event.preventDefault();

  if (inputNotEmpty() && passwordsMatch()) {
    const user = {
      name: inputName.value,
      email: inputEmail.value,
      password: inputPassword.value
    };
    postOrPutJSON("/api/register", "POST", user)
      .then(responseJson => {
        if (responseJson.error) {
          createNotification(responseJson.error, "notifications-container", false);
        } else {
          createNotification("New user registered!", "notifications-container");
          resetForm();
        }
      })
      .catch(console.log);
  }
};

const inputNotEmpty = () => {
  if (inputName.value === "") {
    createNotification("Name field missing.", "notifications-container", false);
  } else if (inputEmail.value === "") {
    createNotification("Email field missing.", "notifications-container", false);
  } else if (inputPassword.value === "") {
    createNotification("Password field missing.", "notifications-container", false);
  } else if (inputPasswordConfirmation.value === "") {
    createNotification("Password confirmation field missing.", "notifications-container", false);
  } else {
    return true;
  }
  return false;
};

const passwordsMatch = () => {
  if (inputPassword.value !== inputPasswordConfirmation.value) {
    createNotification("Password fields didn't match.", "notifications-container", false);
    return false;
  }
  return true;
};

const resetForm = () => {
  inputName.value = "";
  inputEmail.value = "";
  inputPassword.value = "";
  inputPasswordConfirmation.value = "";
};

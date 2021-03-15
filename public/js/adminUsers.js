/**
 * TODO: 8.3 List all users (use <template id="user-template"> in users.html)
 *       - Each user should be put inside a clone of the template fragment
 *       - Each individual user HTML should look like this
 *         (notice the id attributes and values, replace "{userId}" with the actual user id)
 *
 *         <div class="item-row" id="user-{userId}">
 *           <h3 class="user-name" id="name-{userId}">Admin</h3>
 *           <p class="user-email" id="email-{userId}">admin@email.com</p>
 *           <p class="user-role" id="role-{userId}">admin</p>
 *           <button class="modify-button" id="modify-{userId}">Modify</button>
 *           <button class="delete-button" id="delete-{userId}">Delete</button>
 *         </div>
 *
 *       - Each cloned template fragment should be appended to <div id="users-container">
 *       - Use getJSON() function from utils.js to fetch user data from server
 */

const userTemplate = document.getElementById('user-template');
const formTemplate = document.getElementById('form-template');
const usersContainer = document.getElementById('users-container');
const userModify = document.getElementById('modify-user');

getJSON('/api/users')
  .then(users => {
    if (users.error) {
      createNotification(users.error, 'notifications-container', false);
      return;
    }

    users.forEach(user => {
      const userNode = userTemplate.content.cloneNode(true);

      const nameElement = userNode.querySelector("h3");
      nameElement.innerText = user.name;
      nameElement.id = `name-${user._id}`;

      const emailElement = userNode.querySelector(".user-email");
      emailElement.innerText = user.email;
      emailElement.id = `email-${user._id}`;

      const roleElement = userNode.querySelector(".user-role");
      roleElement.innerText = user.role;
      roleElement.id = `role-${user._id}`;

      userNode.querySelector(".modify-button").id = `modify-${user._id}`;
      userNode.querySelector(".modify-button").onclick = () => buttModify(user._id);

      userNode.querySelector(".delete-button").id = `delete-${user._id}`;
      userNode.querySelector(".delete-button").onclick = () => buttDelete(user._id);

      userNode.querySelectorAll(".item-row")[0].id = `id-${user._id}`;
      usersContainer.appendChild(userNode);
    });
  })
  .catch(console.log);

/**
 * TODO: 8.5 Updating/modifying and deleting existing users
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 *       - Use deleteResource() function from utils.js to delete users from server
 *       - Clicking "Delete" button of a user will delete the user and update the listing accordingly
 *       - Clicking "Modify" button of a user will use <template id="form-template"> to
 *         show an editing form populated with the values of the selected user
 *       - The edit form should appear inside <div id="modify-user">
 *       - Afted successful edit of user the form should be removed and the listing updated accordingly
 *       - You can use removeElement() from utils.js to remove the form.
 *       - Remove edit form from the DOM after successful edit or replace it with a new form when another
 *         user's "Modify" button is clicked. There should never be more than one form visible at any time.
 *         (Notice that the edit form has an id "edit-user-form" which should be unique in the DOM at all times.)
 *       - Also remove the edit form when a user is deleted regardless of which user is deleted.
 *       - Modifying a user successfully should show a notification message "Updated user {User Name}"
 *       - Deleting a user successfully should show a notification message "Deleted user {User Name}"
 *       - Use createNotification() function from utils.js to create notifications
 */

// template delete button
const buttDelete = async function(id) {
  removeForm(); // remove existing form

  const userName = document.getElementById(`name-${id}`).innerText;

  await deleteResourse(`/api/users/${ id}`);
  createNotification(`Deleted user ${ userName}`, 'notifications-container');
  removeElement('users-container', `id-${id}`);
};

// template modify button
const buttModify = function(id) {
  removeForm();

  const userName = document.getElementById(`name-${id}`).innerText;
  const userEmail = document.getElementById(`email-${id}`).innerText;

  const form = formTemplate.content.cloneNode(true);

  // update form values
  form.getElementById('id-input').value = id;
  form.getElementById('name-input').value = userName;
  form.getElementById('email-input').value = userEmail;
  form.querySelectorAll('.text-align-center')[0].innerText = `Modify user ${userName}`;

  form.getElementById('update-button').onclick = (event) => {
    event.preventDefault();
    buttUpdate(id);
  };

  userModify.appendChild(form);
};

// Update form button
const buttUpdate = async function(id) {

  const role = document.getElementById('role-input').value;
  const name = document.getElementById('name-input').value;

  const response = await postOrPutJSON(`/api/users/${ id}`, 'PUT', { role });
  
  if (response.error !== undefined) {
    createNotification(response.error, 'notifications-container', false);
  } else {
    // update user usertemplate
    document.getElementById(`role-${ id}`).innerText = role;
    createNotification(`Updated user ${name}`, 'notifications-container');
  }
  removeForm();
};

const removeForm = function() {
  removeElement('modify-user', 'edit-user-form');
};

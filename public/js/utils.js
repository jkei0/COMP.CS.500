/**
 * Asynchronously fetch JSON from the given url. (GET)
 *
 * Uses fetch to get JSON from the backend and returns the parsed
 * JSON back.
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await getJSON("/api/users");
 *
 *   -- OR --
 *
 *   getJSON("/api/users").then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {string} url resource url on the server
 * @returns {Promise<*>} promise that resolves to the parsed JSON
 */
const getJSON = async url => {
  const response = await fetch(url);
  if (response.status === 403) {
    return { error: "Missing authorization to read user data!" };
  }
  return response.json();
};

/**
 * Asynchronously update existing content or create new content on the server (PUT or POST)
 *
 * Uses fetch to send data as JSON to the server and returns the response as JSON.
 * Again remember that async function always returns a Promise.
 *
 * @param {string} url resource url on the server
 * @param {string} method "PUT" or "POST"
 * @param {object|Array} data payload data be sent to the server as JSON
 * @returns {Promise<*>} promise that resolves to the parsed JSON
 */
const postOrPutJSON = async (url, method, data = {}) => {
  method = method.toUpperCase();
  if (method !== 'POST' && method !== 'PUT') {
    throw 'Invalid method! Valid methods are POST and PUT!';
  }

  const init = {
    'method': method,
    'headers': {
      'Content-Type': 'application/json'
    },
    'body': JSON.stringify(data)
  };

  const response = await fetch(url, init);
  return response.json();
};

/**
 * Asynchronously remove a resource from the server (DELETE)
 *
 * Uses fetch to send the request to the server and returns the response as JSON.
 * Again remember that async function always returns a Promise.
 *
 * @param {string} url resource url on the server
 * @returns {Promise<*>} promise that resolves to the parsed JSON
 */
const deleteResourse = async url => {
  // TODO: 8.5 Implement this
  const init = {
    'method' : 'DELETE'
  };
  const response = await fetch(url, init);
  if (response.ok) {
    return response.json();
  }
  else {
    throw new Error(`deleteResource received response: ${response}`);
  }
};

/**
 * Generate random unique id to use as id value on notifications
 * or other HTML elements (remember that IDs must be unique within
 * a document).
 *
 * @returns {string} generated id
 */
const generateId = () => {
  // Shamelessly borrowed from a Gist. See:
  // https://gist.github.com/gordonbrander/2230317
  return (`_${ Math.random().toString(36).substr(2, 9)}`);
};

/**
 * Create a notification message that disappears after five seconds.
 *
 * Appends a new paragraph inside the container element and gives it
 * class based on the status of the message (success or failure).
 *
 * @param {string} message Message to be displayed to user
 * @param {string} containerId id attribute of the container element
 * @param {boolean} isSuccess whether the message describes a success or a failure
 */
const createNotification = (message, containerId, isSuccess = true) => {
  const container = document.getElementById(containerId);

  // Create new p element to hold text
  const newParagraph = document.createElement('p');

  // Create unique id for the notification so that it can easily be removed after timeout
  const notificationId = generateId();
  newParagraph.id = notificationId;

  // Set CSS class for the paragraph based on the isSuccess variable
  newParagraph.classList.add(isSuccess ? 'background-lightgreen' : 'background-red');

  // Add message test inside the paragraph and append the paragraph to the container
  newParagraph.append(document.createTextNode(message));
  container.append(newParagraph);

  // After five seconds remove the notification
  setTimeout(() => {
    removeElement(containerId, notificationId);
  }, 5000);
};

/**
 * Remove an element (and its descendants) from the DOM.
 *
 * @param {string} containerId containing element's id
 * @param {string} elementId id of the element to be removed
 */
const removeElement = (containerId, elementId) => {
  const container = document.getElementById(containerId);
  container.querySelectorAll(`#${elementId}`).forEach(element => element.remove());
};

/**
 * Add item to shopping cart.
 *
 * @param {string} id product id
 */
const addProductToCart = (id) => {
  const amount = sessionStorage.getItem(id);
  if(amount === null) {
    sessionStorage.setItem(id, 1);
  }
  else {
    sessionStorage.setItem(id, parseInt(amount)+1);
  }
};

/**
 * remove product from shopping cart.
 *
 * @param {string} id product id
 */
const decreaseProductCount = (id) => {
  const amount = sessionStorage.getItem(id);
  if(amount === '1') {
    sessionStorage.removeItem(id);
  }
  else {
    sessionStorage.setItem(id, parseInt(amount)-1);
  }
};

/**
 * clears shopping cart
 */
const clearCart = () => {
  sessionStorage.clear();
};

/**
 * get product count from shopping cart
 *
 * @param {string} id product id
 * @returns {string|null} product count, null if product not found
 */
const getProductCountFromCart = (id) => {
  return sessionStorage.getItem(id);
};

/**
 * Add item to shopping cart.
 *
 * @returns {Array} all product ids in shopping cart
 */
const getAllProductsFromCart = () => {
  return Object.keys(sessionStorage);
};

/**
 * Send order to the server
 */
const sendOrder = async () => {

  const products = getAllProductsFromCart();

  const items = products.map(async productID => {
    const productCount = getProductCountFromCart(productID);
    const productInfo = await getJSON(`/api/products/${productID}`);
    const item = {product: productInfo, quantity: productCount};
    return item;
  });

  const productArray = await Promise.all(items);

  const order = {
    items: productArray
  };
  const response = await postOrPutJSON("/api/orders", "POST", order);
};

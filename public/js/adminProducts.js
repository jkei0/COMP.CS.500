const productTemplate = document.getElementById('product-template');
const productContainer = document.getElementById('products-container');

const addProductToList = (product) => {
  const productNode = productTemplate.content.cloneNode(true);

  const productRow = productNode.querySelector('.item-row');
  productRow.id = `product-${product._id}`;

  const productName = productNode.querySelector('h3');
  productName.innerText = product.name;
  productName.id = `name-${product._id}`;

  const productDescription = productNode.querySelector('.product-description');
  productDescription.innerText = product.description;
  productDescription.id = `description-${product._id}`;

  const productPrice = productNode.querySelector('.product-price');
  productPrice.innerText = product.price;
  productPrice.id = `price-${product._id}`;

  const productImage = productNode.querySelector('.product-image');
  productImage.src = product.image;
  productImage.id = `image-${product._id}`;
  productImage.alt = `Image of ${product.name}`;

  productNode.querySelector('.product-edit-button').id = `edit-button-${product._id}`;
  productNode.querySelector('.product-edit-button').onclick = () => editProduct(product._id);

  productNode.querySelector('.product-delete-button').id = `delete-button-${product._id}`;
  productNode.querySelector('.product-delete-button').onclick = () => deleteProduct(product._id);

  // Edit form
  const editForm = productNode.querySelector('.edit-product-form');
  editForm.id = `edit-product-${product._id}`;

  const productEditName = productNode.querySelector('.edit-product-name');
  productEditName.value = product.name;
  productEditName.id = `edit-name-${product._id}`;
  const nameLabel = productNode.querySelector(".name-label");
  nameLabel.htmlFor = `edit-name-${product._id}`;

  const productEditDescription = productNode.querySelector('.edit-product-description');
  productEditDescription.value = product.description;
  productEditDescription.id = `edit-description-${product._id}`;
  const descriptionLabel = productNode.querySelector(".description-label");
  descriptionLabel.htmlFor = `edit-description-${product._id}`;

  const productEditPrice = productNode.querySelector('.edit-product-price');
  productEditPrice.value = product.price;
  productEditPrice.id = `edit-price-${product._id}`;
  const priceLabel = productNode.querySelector(".price-label");
  priceLabel.htmlFor = `edit-price-${product._id}`;

  const productEditImage = productNode.querySelector('.edit-product-image');
  productEditImage.value = product.image;
  productEditImage.id = `edit-image-${product._id}`;
  const imageLabel = productNode.querySelector('.image-label');
  imageLabel.htmlFor = `edit-image-${product._id}`;

  productNode.querySelector('.save-edit-button').id = `save-edit-${product._id}`;
  productNode.querySelector('.save-edit-button').onclick = () => saveProductEdits(product._id);

  productNode.querySelector('.close-edit-button').id = `close-edit-${product._id}`;
  productNode.querySelector('.close-edit-button').onclick = () => closeEdit(product._id);

  productContainer.appendChild(productNode);
};

/* NEW PRODUCTS FORM */

const newProductForm = document.getElementById("new-product-form");
newProductForm.onsubmit = event => {
  event.preventDefault();
  
  const nameField = document.getElementById("new-product-name");
  const descriptionField = document.getElementById("new-product-description");
  const imageField = document.getElementById("new-product-image");
  const priceField = document.getElementById("new-product-price");

  const newProduct = {
    name: nameField.value,
    description: descriptionField.value,
    image: imageField.value,
    price: priceField.value
  }

  postOrPutJSON("/api/products", "POST", newProduct)
    .then(savedProduct => {
      if (savedProduct.error) {
        createNotification(savedProduct.error, 'notifications-container', false);
        return;
      }

      addProductToList(savedProduct);
      createNotification("Product saved to database!", 'notifications-container', true);
    })
    .catch(error => {
      createNotification("Only admins can edit products!", 'notifications-container', false);
    });
};

/* FILLING PRODUCTS LIST */

getJSON('/api/products')
.then(products => {
  if (products.error) {
    createNotification(products.error, 'notifications-container', false);
    return;
  }
  products.forEach(addProductToList);
});

/* EDIT BUTTON ON EACH PRODUCT */

const editProduct = (productId) => {
  const editForm = document.querySelector(`#edit-product-${productId}`);
  editForm.style = "display: block";
};

/* DELETE BUTTON ON EACH PRODUCT */

const deleteProduct = (productId) => {
  const productURI = `/api/products/${productId}`;
  deleteResourse(productURI)
    .then(() => {
      // The only reason deleting a product would fail is if the product was already removed or didn't exist
      // Therefore no error handling required
      document.getElementById(`product-${productId}`).remove();
      createNotification("Product deleted!", 'notifications-container', true);
    })
    .catch(error => {
      createNotification("Only admins can edit products!", 'notifications-container', false);
    });
};

/* SAVE EDITS BUTTON ON EDIT FORM */

const saveProductEdits = (productId) => {
  const editedName = document.querySelector(`#edit-name-${productId}`);
  const editedDescription = document.querySelector(`#edit-description-${productId}`);
  const editedPrice = document.querySelector(`#edit-price-${productId}`);
  const editedImage = document.querySelector(`#edit-image-${productId}`);

  const editedProduct = {
    name: editedName.value,
    description: editedDescription.value,
    price: editedPrice.value,
    image: editedImage.value
  }

  const productURI = `/api/products/${productId}`;
  postOrPutJSON(productURI, "PUT", editedProduct)
    .then(savedProduct => {
      if (savedProduct.error) {
        createNotification(savedProduct.error, 'notifications-container', false);
        return;
      }

      document.querySelector(`#name-${productId}`).innerText = savedProduct.name;
      document.querySelector(`#description-${productId}`).innerText = savedProduct.description;
      document.querySelector(`#price-${productId}`).innerText = savedProduct.price;
      document.querySelector(`#image-${productId}`).src = savedProduct.image;
      document.querySelector(`#image-${productId}`).alt = `Image of ${savedProduct.name}`;

      createNotification("Product edits saved!", 'notifications-container', true);
      closeEdit(productId);
    })
    .catch(error => {
      createNotification("Only admins can edit products!", 'notifications-container', false);
    });
};

/* CLOSE EDITOR BUTTON ON EDIT FORM */

const closeEdit = (productId) => {
  const editForm = document.querySelector(`#edit-product-${productId}`);
  editForm.style = "display: none";
};
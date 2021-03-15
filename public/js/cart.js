const cartProducts = getAllProductsFromCart();
const cartTemplate = document.getElementById('cart-item-template');
const cartContainer = document.getElementById('cart-container');

getJSON('/api/products')
.then(products => {
  if (products.error) {
    createNotification(products.error, 'notifications-container', false);
    return;
  }
  products.forEach(product => {

    if(cartProducts.includes(product._id)) {
      const cartNode = cartTemplate.content.cloneNode(true);

      cartNode.querySelectorAll(".item-row")[0].id = `id-${product._id}`;

      const productName = cartNode.querySelector('h3');
      productName.innerText = product.name;
      productName.id = `name-${product._id}`;

      const productPrice = cartNode.querySelector('.product-price');
      productPrice.innerText = product.price;
      productPrice.id = `price-${product._id}`;

      const productAmount = cartNode.querySelector('.product-amount');
      productAmount.innerText = `${getProductCountFromCart(product._id)}x`;
      productAmount.id = `amount-${product._id}`;

      const minusButton = cartNode.querySelectorAll('.cart-minus-plus-button')[1];
      minusButton.id = `minus-${product._id}`;
      minusButton.onclick = () => buttonMinus(product._id);

      const plusButton = cartNode.querySelectorAll('.cart-minus-plus-button')[0];
      plusButton.id = `plus-${product._id}`;
      plusButton.onclick = () => buttonPlus(product._id);

      cartContainer.appendChild(cartNode);
    }
  });
});

document.getElementById('place-order-button').addEventListener('click', async function() {
  // for(const item of cartProducts) {
  //   removeElement('cart-container', `id-${item}`);
  // }
  try {
    await sendOrder();
    createNotification('Successfully created an order!', 'notifications-container');
  }
  catch {
    createNotification('Failed to create an order', 'notifications-container', false);
  }
  cartProducts.map(item => {
    removeElement('cart-container', `id-${item}`);
  });
  clearCart();
});

const buttonMinus = (id) => {
  const amount = getProductCountFromCart(id);
  decreaseProductCount(id);
  if(amount > 1) {
    document.getElementById(`amount-${id}`).innerText = `${getProductCountFromCart(id)}x`;
  }
  else {
    removeElement('cart-container', `id-${id}`);
  }
};

const buttonPlus = (id) => {
  addProductToCart(id);
  document.getElementById(`amount-${id}`).innerText = `${getProductCountFromCart(id)}x`;
};

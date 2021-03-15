const productTemplate = document.getElementById('product-template');
const productContainer = document.getElementById('products-container');

getJSON('/api/products')
.then(products => {
  if (products.error) {
    createNotification(products.error, 'notifications-container', false);
    return;
  }
  products.forEach(product => {
    const productNode = productTemplate.content.cloneNode(true);

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

    productNode.querySelector('button').id = `add-to-cart-${product._id}`;
    productNode.querySelector('button').onclick = () => buttonToCart(product._id, product.name);

    productContainer.appendChild(productNode);
  });
})
.catch(console.log);

const buttonToCart = function(id, name) {
  addProductToCart(id);
  createNotification(`Added ${name} to cart!`, 'notifications-container');
};

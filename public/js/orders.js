const orderTemplate = document.getElementById('order-template');
const productTemplate = document.getElementById('product-template');
const orderContainer = document.getElementById('order-container');
const productContainer = document.getElementById('product-container');

const addToOrderList = async (order) => {
  const orderNode = orderTemplate.content.cloneNode(true);
  orderNode.id = order.customerId;
  orderNode.querySelector(".order-id").innerText = `Order number: ${order._id}`;

  let totalPrice = 0;
  order.products.forEach(product => {
    if(product !== null) {
      const productNode = productTemplate.content.cloneNode(true);
      productNode.querySelector(".product-name").innerText = product.product.name;
      productNode.querySelector(".product-price").innerText = `${product.product.price} EUR`;
      productNode.querySelector(".product-quantity").innerText = `Quantity: ${product.quantity}`;
      orderNode.querySelector(".products").appendChild(productNode);
      totalPrice = totalPrice + product.product.price*product.quantity;
    }
  });
  totalPrice = Math.round(totalPrice*100)/100;
  orderNode.querySelector(".total-price").innerText = `Total: ${totalPrice} EUR`;
  orderContainer.appendChild(orderNode);
};

/* Fill order list */
getJSON('/api/orders')
.then(orders => {
  orders.forEach(addToOrderList);
});

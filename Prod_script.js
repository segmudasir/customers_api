
const server = 'https://customers-api-bjx4.onrender.com'; // Change this to your render.com URL 

async function loadProducts() {
  try {
    const response = await fetch(`${server}/products`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const products = await response.json();

    const container = document.getElementById('product-container');
    if (!container) {
      console.error("No element with id 'product-container' found in HTML");
      return;
    }

    container.innerHTML = ''; // Clear existing content

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      // Construct full URL for image using the server constant
      const imgUrl = `${server}${product.ImagePath}`;

      card.innerHTML = `
        <img src="${imgUrl}" alt="${product.ProductName}" />
        <h3 class="product-title">${product.ProductName}</h3>
        <p class="product-price">$${product.Price.toFixed(2)}</p>
        <button class="add-to-cart">Add to Cart</button>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

// Load products once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadProducts);
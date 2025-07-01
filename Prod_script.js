// Prod_script.js

// This function fetches products from your API and displays them
async function loadProducts() {
  try {
    const response = await fetch('http://localhost:5000/products');
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

      // Construct full URL for image to load from backend server
      const imgUrl = `http://localhost:5000${product.ImagePath}`;

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

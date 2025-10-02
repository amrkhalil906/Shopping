document.addEventListener('DOMContentLoaded', () => {
    const getLoggedInUserEmail = () => localStorage.getItem('loggedInUserEmail');
    const currentUserEmail = getLoggedInUserEmail();
    const productListContainer = document.getElementById('purchased-products-list');

    // 1. Check if user is logged in
    if (!currentUserEmail) {
        productListContainer.innerHTML = '<p>يرجى تسجيل الدخول لعرض مشترياتك.</p>';
        return;
    }

    // 2. Get all orders from localStorage
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];

    // 3. Filter orders for the current user
    const myOrders = allOrders.filter(order => order.customerEmail === currentUserEmail);

    // 4. Get all unique purchased products from those orders
    const purchasedProducts = new Map(); // Use a Map to store unique products by ID
    myOrders.forEach(order => {
        order.items.forEach(item => {
            // Only add products that have digital content and are not already in the map
            if ((item.video || item.pdf) && !purchasedProducts.has(item.id)) {
                purchasedProducts.set(item.id, item);
            }
        });
    });

    // 5. Render the products to the page
    if (purchasedProducts.size === 0) {
        productListContainer.innerHTML = '<p>لم تقم بشراء أي منتجات رقمية بعد.</p>';
        return;
    }

    productListContainer.innerHTML = '';
    purchasedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        const imageUrl = product.image || `https://via.placeholder.com/300x200?text=${product.name}`;

        let digitalLinksHTML = '';
        if (product.video) {
            digitalLinksHTML += `<a href="${product.video}" target="_blank" class="button-digital-download">🎬 شاهد الفيديو</a>`;
        }
        if (product.pdf) {
            digitalLinksHTML += `<a href="${product.pdf}" download="${product.name}.pdf" class="button-digital-download">📄 حمّل الـ PDF</a>`;
        }
        
        productCard.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="digital-links-container">
                    ${digitalLinksHTML}
                </div>
            </div>
        `;
        productListContainer.appendChild(productCard);
    });
});
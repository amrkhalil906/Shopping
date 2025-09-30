// The complete and corrected code for admin.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. AUTHENTICATION: Check if the user is an admin, otherwise redirect
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    // 2. DOM ELEMENTS
    const pendingProductsList = document.getElementById('pending-products-list');
    const adminLogoutBtn = document.getElementById('admin-logout');
    
    // =================================================================
    // == 3. HELPER FUNCTIONS (The Missing Logic) ======================
    // =================================================================

    /**
     * Gathers all products from all users into a single array.
     * This is the core function to get data for the admin.
     * @returns {Array} A single array of all products.
     */
    function getAllProductsFromAllUsers() {
        const allUsers = JSON.parse(localStorage.getItem('userCredentials')) || [];
        let allProducts = [];

        allUsers.forEach(user => {
            const userProductsKey = `userProducts_${user.email}`;
            const userProducts = JSON.parse(localStorage.getItem(userProductsKey)) || [];
            allProducts = allProducts.concat(userProducts);
        });
        return allProducts;
    }

    /**
     * Finds a product by its ID, updates its status, and saves it back
     * to the correct user's product list in localStorage.
     * @param {string|number} productId The ID of the product to update.
     * @param {string} newStatus The new status ('accepted' or 'rejected').
     */
    function updateProductStatus(productId, newStatus) {
        const productToUpdate = getAllProductsFromAllUsers().find(p => p.id == productId);

        if (!productToUpdate) {
            console.error("Admin Error: Product with ID " + productId + " not found!");
            return;
        }

        const ownerEmail = productToUpdate.userEmail;
        const userProductsKey = `userProducts_${ownerEmail}`;
        const userProducts = JSON.parse(localStorage.getItem(userProductsKey)) || [];
        
        const productIndex = userProducts.findIndex(p => p.id == productId);

        if (productIndex > -1) {
            userProducts[productIndex].status = newStatus;
            localStorage.setItem(userProductsKey, JSON.stringify(userProducts));
        }
    }

    // ===============================================================
    // == 4. RENDERING AND EVENT HANDLING ============================
    // ===============================================================

    /**
     * Renders products with a 'pending' status to the admin dashboard.
     */
    const renderProducts = () => {
        const allProducts = getAllProductsFromAllUsers();
        const pendingProducts = allProducts.filter(p => p.status === 'pending');
        
        pendingProductsList.innerHTML = '';

        if (pendingProducts.length === 0) {
            pendingProductsList.innerHTML = '<p style="text-align: center; color: #888;">لا توجد منتجات قيد المراجعة.</p>';
            return;
        }

        pendingProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card admin-card'; 
            const imageUrl = product.image || `https://via.placeholder.com/300x200/999/FFFFFF?text=Product`;
            
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p><strong>بواسطة:</strong> ${product.userEmail}</p>
                    <p>${product.description.substring(0, 80)}...</p>
                    <div class="product-price">${product.price} جنيه</div>
                </div>
                <div class="product-actions">
                    <button class="approve-btn" data-id="${product.id}">قبول</button>
                    <button class="reject-btn" data-id="${product.id}">رفض</button>
                </div>
            `;
            pendingProductsList.appendChild(productCard);
        });
    };

    // Event listener for the entire page to handle clicks on approve/reject buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('approve-btn')) {
            const productId = e.target.dataset.id;
            updateProductStatus(productId, 'accepted');
            alert('تم قبول المنتج بنجاح!');
            renderProducts(); // Refresh the list
        }
        
        if (e.target.classList.contains('reject-btn')) {
            const productId = e.target.dataset.id;
            updateProductStatus(productId, 'rejected');
            alert('تم رفض المنتج.');
            renderProducts(); // Refresh the list
        }
    });

    // Logout button logic
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('isAdmin', 'false');
            window.location.href = 'index.html';
        });
    }

    // Initial call to display products when the page loads
    renderProducts();
});
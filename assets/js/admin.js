// The complete and corrected code for admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is an admin, otherwise redirect
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    const pendingProductsList = document.getElementById('pending-products-list');
    const adminLogoutBtn = document.getElementById('admin-logout');
    
    // --- Renders pending products using the product-manager ---
    const renderProducts = () => {
        // Now gets ALL products from the single source of truth
        const allProducts = getProducts(); 
        
        const pendingProducts = allProducts.filter(p => p.status === 'pending');
        
        pendingProductsList.innerHTML = '';

        if (pendingProducts.length === 0) {
            pendingProductsList.innerHTML = '<p style="text-align: center; color: #888;">لا توجد منتجات قيد المراجعة.</p>';
            return;
        }

        pendingProducts.forEach(product => {
            const productCard = document.createElement('div');
            // Using a unique class for the admin card
            productCard.className = 'product-card-admin'; 
            const imageUrl = product.image || `https://via.placeholder.com/300x200/999/FFFFFF?text=${product.name}`;
            
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p><strong>بواسطة:</strong> ${product.userEmail}</p>
                    <p>${product.description}</p>
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

    // --- Updates product status using the product-manager ---
    const updateProductStatus = (id, newStatus) => {
        const allProducts = getProducts();
        const productIndex = allProducts.findIndex(p => p.id == id);
        
        if (productIndex > -1) {
            allProducts[productIndex].status = newStatus;
            // Saves the entire updated list back to the single source of truth
            saveProducts(allProducts); 
        }
    };

    // --- Event listener for approve/reject buttons ---
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card-admin');
        if (!productCard) return;

        const productId = e.target.dataset.id;

        if (e.target.classList.contains('approve-btn')) {
            updateProductStatus(productId, 'accepted');
            alert('تم قبول المنتج بنجاح!');
            productCard.remove(); // Removes card from UI
        }
        
        if (e.target.classList.contains('reject-btn')) {
            updateProductStatus(productId, 'rejected');
            alert('تم رفض المنتج.');
            productCard.remove(); // Removes card from UI
        }
    });

    // --- Logout button logic ---
    if(adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('isAdmin', 'false');
            window.location.href = 'index.html';
        });
    }

    // Initial render of products when the page loads
    renderProducts();
});

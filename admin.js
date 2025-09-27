document.addEventListener('DOMContentLoaded', () => {
    const userCredentials = [
        { email: 'amrkhalil258@gmail.com', password: '356895' },
        { email: 'amr58@gmail.com', password: '486568' }
    ];

    const getLoggedInUserEmail = () => localStorage.getItem('loggedInUserEmail');
    const getUserProducts = (email) => {
        const key = `userProducts_${email}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    };
    const saveUserProducts = (email, products) => {
        const key = `userProducts_${email}`;
        localStorage.setItem(key, JSON.stringify(products));
    };

    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (!isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    const pendingProductsList = document.getElementById('pending-products-list');
    const adminLogoutBtn = document.getElementById('admin-logout');
    
    // Function to get all products from all users
    const getAllUserProducts = () => {
        let allProducts = [];
        userCredentials.forEach(user => {
            const products = getUserProducts(user.email);
            allProducts = allProducts.concat(products.map(product => ({ ...product, userEmail: user.email })));
        });
        return allProducts;
    };

    const renderProducts = () => {
        const allProducts = getAllUserProducts();
        
        const pendingProducts = allProducts.filter(p => p.status === 'pending');
        
        pendingProductsList.innerHTML = '';

        if (pendingProducts.length === 0) {
            pendingProductsList.innerHTML = '<p style="text-align: center; color: #888;">لا توجد منتجات قيد المراجعة.</p>';
            return;
        }

        pendingProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card', 'admin-card');
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
                    <button class="approve-btn" data-id="${product.id}" data-email="${product.userEmail}">قبول</button>
                    <button class="reject-btn" data-id="${product.id}" data-email="${product.userEmail}">رفض</button>
                </div>
            `;
            pendingProductsList.appendChild(productCard);
        });
    };

    const updateProductStatus = (id, email, status) => {
        const userProducts = getUserProducts(email);
        const productIndex = userProducts.findIndex(p => p.id == id);
        if (productIndex > -1) {
            userProducts[productIndex].status = status;
            saveUserProducts(email, userProducts);
            renderProducts();
        }
    };

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('approve-btn')) {
            const productId = e.target.dataset.id;
            const userEmail = e.target.dataset.email;
            updateProductStatus(productId, userEmail, 'accepted');
            alert('تم قبول المنتج بنجاح!');
        }
        
        if (e.target.classList.contains('reject-btn')) {
            const productId = e.target.dataset.id;
            const userEmail = e.target.dataset.email;
            updateProductStatus(productId, userEmail, 'rejected');
            alert('تم رفض المنتج.');
        }
    });

    adminLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('isAdmin', 'false');
        window.location.href = 'index.html';
    });

    renderProducts();
});
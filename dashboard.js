document.addEventListener('DOMContentLoaded', () => {
    // التحقق من حالة تسجيل الدخول
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html'; // إعادة التوجيه لصفحة المتجر إذا لم يكن مسجلاً
        return;
    }

    let userProducts = JSON.parse(localStorage.getItem('userProducts')) || [];

    const productArea = document.querySelector('.product-area');
    const dashboardProductList = document.getElementById('dashboard-product-list');
    const addProductModal = document.getElementById('add-product-modal');
    const closeProductModalBtn = document.getElementById('close-product-modal-btn');
    const productForm = document.getElementById('product-form');
    const submitBtn = productForm.querySelector('.submit-btn');
    const editBtn = productForm.querySelector('.edit-btn');
    const deleteBtn = productForm.querySelector('.delete-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    const categoryLinks = document.querySelectorAll('.category-list a');

    const showProductModal = () => {
        addProductModal.style.display = 'flex';
        productForm.reset();
        submitBtn.textContent = 'إرسال';
        submitBtn.classList.remove('pending');
        submitBtn.style.display = 'inline-block';
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
    };

    const renderUserProducts = (category) => {
        dashboardProductList.innerHTML = '';
        const filteredProducts = category === 'all' ? userProducts : userProducts.filter(p => p.category === category);
        
        if (filteredProducts.length === 0) {
            dashboardProductList.innerHTML = '<p style="text-align: center; color: #888;">لا توجد منتجات في هذا القسم.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="https://via.placeholder.com/300x200/999/FFFFFF?text=Product" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">${product.price} جنيه</div>
                </div>
            `;
            productCard.addEventListener('click', () => {
                document.getElementById('product-id').value = product.id;
                document.getElementById('store-name').value = product.storeName;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-description').value = product.description;
                document.getElementById('product-price').value = product.price;
                document.getElementById('shipping-cost').value = product.shippingCost;
                
                submitBtn.style.display = 'none';
                editBtn.style.display = 'inline-block';
                deleteBtn.style.display = 'inline-block';
                showProductModal();
            });
            dashboardProductList.appendChild(productCard);
        });
    };
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            renderUserProducts(category);
            categoryLinks.forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    const addProductBtns = document.querySelectorAll('.add-product-btn');
    addProductBtns.forEach(btn => {
        btn.addEventListener('click', showProductModal);
    });

    closeProductModalBtn.addEventListener('click', () => {
        addProductModal.style.display = 'none';
    });
    
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newProduct = {
            id: Date.now(),
            storeName: document.getElementById('store-name').value,
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: document.getElementById('product-price').value,
            shippingCost: document.getElementById('shipping-cost').value,
            category: document.querySelector('.category-list a.active').dataset.category,
            status: 'pending' // حالة المنتج: قيد القبول
        };
        
        userProducts.push(newProduct);
        localStorage.setItem('userProducts', JSON.stringify(userProducts));
        
        submitBtn.textContent = 'قيد القبول';
        submitBtn.classList.add('pending');
        
        alert('تم إرسال المنتج للموافقة!');
        addProductModal.style.display = 'none';
        renderUserProducts(newProduct.category);
    });

    editBtn.addEventListener('click', () => {
        const productId = document.getElementById('product-id').value;
        const productIndex = userProducts.findIndex(p => p.id == productId);
        if (productIndex > -1) {
            userProducts[productIndex] = {
                id: productId,
                storeName: document.getElementById('store-name').value,
                name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value,
                price: document.getElementById('product-price').value,
                shippingCost: document.getElementById('shipping-cost').value,
                category: userProducts[productIndex].category,
                status: 'pending' // إعادة المنتج إلى حالة قيد القبول بعد التعديل
            };
            localStorage.setItem('userProducts', JSON.stringify(userProducts));
            alert('تم تعديل المنتج بنجاح!');
            addProductModal.style.display = 'none';
            renderUserProducts('all');
        }
    });

    deleteBtn.addEventListener('click', () => {
        const productId = document.getElementById('product-id').value;
        userProducts = userProducts.filter(p => p.id != productId);
        localStorage.setItem('userProducts', JSON.stringify(userProducts));
        alert('تم حذف المنتج بنجاح!');
        addProductModal.style.display = 'none';
        renderUserProducts('all');
    });

    // وظيفة تسجيل الخروج
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    });

    renderUserProducts('all');
});
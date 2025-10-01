document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SETUP AND USER AUTHENTICATION ---
    const getLoggedInUserEmail = () => localStorage.getItem('loggedInUserEmail');
    const currentUserEmail = getLoggedInUserEmail();

    if (!currentUserEmail) {
        window.location.href = 'index.html'; // Redirect if not logged in
        return;
    }

    const userProductsKey = `userProducts_${currentUserEmail}`;

    // --- 2. DOM ELEMENTS ---
    const dashboardProductList = document.getElementById('dashboard-product-list');
    const dashboardSearchInput = document.getElementById('dashboard-search-input');
    const addProductModal = document.getElementById('add-product-modal');
    const closeProductModalBtn = document.getElementById('close-product-modal-btn');
    const productForm = document.getElementById('product-form');
    const submitBtn = productForm.querySelector('.submit-btn');
    const editBtn = productForm.querySelector('.edit-btn');
    const deleteBtn = productForm.querySelector('.delete-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const categoryLinks = document.querySelectorAll('.category-list a');
    const mainAddProductBtn = document.querySelector('.add-product-btn-main');

    // --- 3. HELPER FUNCTIONS for data management ---
    const getUserProducts = () => JSON.parse(localStorage.getItem(userProductsKey)) || [];
    const saveUserProducts = (products) => localStorage.setItem(userProductsKey, JSON.stringify(products));
    const openModal = () => addProductModal.style.display = 'flex';
    const closeModal = () => addProductModal.style.display = 'none';

    // Helper to read files for saving in localStorage
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // --- 4. MAIN RENDER FUNCTION (with SEARCH) ---
    const renderUserProducts = (category = 'all', searchTerm = '') => {
        dashboardProductList.innerHTML = '';
        const userProducts = getUserProducts();

        // Step 1: Filter by search term
        let filteredProducts = userProducts.filter(product => {
            const query = searchTerm.toLowerCase().trim();
            if (!query) return true;
            const searchableText = [
                product.name, product.description, product.category, product.price.toString()
            ].join(' ').toLowerCase();
            return searchableText.includes(query);
        });

        // Step 2: Filter by category
        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        if (filteredProducts.length === 0) {
            dashboardProductList.innerHTML = '<p style="text-align: center; color: #888;">لا توجد منتجات تطابق بحثك في هذا القسم.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            const imageUrl = product.image || `https://via.placeholder.com/300x200/999/FFFFFF?text=Product`;
            
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description.substring(0, 80)}...</p>
                    <div class="product-price">${product.price} جنيه</div>
                </div>
            `;
            productCard.addEventListener('click', () => {
                // Populate form for editing
                document.getElementById('product-id').value = product.id;
                document.getElementById('store-name').value = product.storeName;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-description').value = product.description;
                document.getElementById('product-price').value = product.price;
                document.getElementById('shipping-cost').value = product.shippingCost;
                
                submitBtn.style.display = 'none';
                editBtn.style.display = 'inline-block';
                deleteBtn.style.display = 'inline-block';
                openModal();
            });
            dashboardProductList.appendChild(productCard);
        });
    };
    
    // --- 5. EVENT LISTENERS ---

    // Search input listener
    dashboardSearchInput.addEventListener('input', () => {
        const activeCategory = document.querySelector('.category-list a.active')?.dataset.category || 'all';
        renderUserProducts(activeCategory, dashboardSearchInput.value);
    });

    // Category links listener
categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.dataset.category;
        
        // تحديث الكلاس النشط على الروابط
        categoryLinks.forEach(item => item.classList.remove('active'));
        e.target.classList.add('active');

        // إعادة عرض المنتجات للقسم المختار
        renderUserProducts(category, dashboardSearchInput.value);

        // --- الكود النهائي للانتقال ---
        // ننتظر لحظة قصيرة جدًا للتأكد من أن المتصفح قد رسم المنتجات
        setTimeout(() => {
            const productArea = document.querySelector('.product-area');
            if (productArea) {
                // الانتقال إلى بداية منطقة عرض المنتجات
                productArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50); // تأخير بسيط جدًا لضمان الموثوقية
    });
});

    // Open modal for NEW product
    mainAddProductBtn.addEventListener('click', () => {
        productForm.reset();
        document.getElementById('product-id').value = ''; // Ensure ID is empty
        submitBtn.style.display = 'inline-block';
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        openModal();
    });

    closeProductModalBtn.addEventListener('click', closeModal);

    // Form submission (for both new and edited products)
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('product-id').value;
        const userProducts = getUserProducts();
        
        const imageFile = document.getElementById('product-image').files[0];
        const category = document.querySelector('.category-list a.active')?.dataset.category || 'all';

        if (productId) { // Editing existing product
            const productIndex = userProducts.findIndex(p => p.id == productId);
            if (productIndex > -1) {
                userProducts[productIndex] = {
                    ...userProducts[productIndex], // Preserve old data like status
                    storeName: document.getElementById('store-name').value,
                    name: document.getElementById('product-name').value,
                    description: document.getElementById('product-description').value,
                    price: document.getElementById('product-price').value,
                    shippingCost: document.getElementById('shipping-cost').value,
                    image: imageFile ? await readFileAsDataURL(imageFile) : userProducts[productIndex].image,
                    category: category,
                    status: 'pending' // Always reset to pending on edit
                };
                alert('تم تعديل المنتج بنجاح وسيتم مراجعته.');
            }
        } else { // Adding new product
            const newProduct = {
                id: Date.now(),
                userEmail: currentUserEmail,
                storeName: document.getElementById('store-name').value,
                name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value,
                price: document.getElementById('product-price').value,
                shippingCost: document.getElementById('shipping-cost').value,
                image: await readFileAsDataURL(imageFile),
                category: category,
                status: 'pending'
            };
            userProducts.push(newProduct);
            alert('تمت إضافة المنتج بنجاح وسيتم مراجعته.');
        }

        saveUserProducts(userProducts);
        closeModal();
        renderUserProducts(category, dashboardSearchInput.value);
    });

    // Delete button listener
    deleteBtn.addEventListener('click', () => {
        const productId = document.getElementById('product-id').value;
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
            let userProducts = getUserProducts();
            userProducts = userProducts.filter(p => p.id != productId);
            saveUserProducts(userProducts);
            alert('تم حذف المنتج بنجاح!');
            closeModal();
            renderUserProducts('all', dashboardSearchInput.value);
        }
    });

    // Logout button listener
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUserEmail');
        window.location.href = 'index.html';
    });

    // --- 6. INITIAL RENDER ---
    renderUserProducts('all');
});


// ========================================================================
// === FINAL AND COMPLETE dashboard.js FILE (Reviewed Oct 2, 2025) ======
// ========================================================================

/**
 * HELPER FUNCTION: Reads a file and converts it to a Base64 Data URL.
 * This function is placed in the global scope (outside) so it's available everywhere.
 */
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

/**
 * MAIN SCRIPT: This listener waits for the HTML document to be fully loaded
 * before running any JavaScript, ensuring all elements are ready.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- SECTION 1: SETUP AND USER AUTHENTICATION ---
    // Checks if a user is logged in and gets their email. Redirects if not logged in.
    const getLoggedInUserEmail = () => localStorage.getItem('loggedInUserEmail');
    const currentUserEmail = getLoggedInUserEmail();

    if (!currentUserEmail) {
        window.location.href = 'index.html';
        return;
    }

    const userProductsKey = `userProducts_${currentUserEmail}`;

    // --- SECTION 2: DOM ELEMENT SELECTION ---
    // Gathers all necessary HTML elements into variables for easy access.
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

    // --- SECTION 3: CORE HELPER FUNCTIONS ---
    // Functions for getting/saving products and opening/closing the modal.
    const getUserProducts = () => JSON.parse(localStorage.getItem(userProductsKey)) || [];
    const saveUserProducts = (products) => localStorage.setItem(userProductsKey, JSON.stringify(products));
    const openModal = () => addProductModal.style.display = 'flex';
    const closeModal = () => addProductModal.style.display = 'none';
    
    // --- SECTION 4: MAIN RENDER FUNCTION ---
    // This function is responsible for displaying the products on the page.
    // It handles both category filtering and search functionality.
    const renderUserProducts = (category = 'all', searchTerm = '') => {
        dashboardProductList.innerHTML = '';
        const userProducts = getUserProducts();

        let filteredProducts = userProducts.filter(product => {
            const query = searchTerm.toLowerCase().trim();
            if (!query) return true;
            const searchableText = [product.name, product.description, product.category, product.price.toString()].join(' ').toLowerCase();
            return searchableText.includes(query);
        });

        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        if (filteredProducts.length === 0) {
            dashboardProductList.innerHTML = '<p style="text-align: center; color: #888;">لا توجد منتجات.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            const imageUrl = product.image || `https://via.placeholder.com/300x200`;
            
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description.substring(0, 80)}...</p>
                    <div class="product-price">${product.price} جنيه</div>
                </div>`;
            
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
                openModal();
            });
            dashboardProductList.appendChild(productCard);
        });
    };
    
    // --- SECTION 5: EVENT LISTENERS ---
    // This section connects user actions (clicks, typing) to JavaScript functions.

    if(dashboardSearchInput) {
        dashboardSearchInput.addEventListener('input', () => {
            const activeCategory = document.querySelector('.category-list a.active')?.dataset.category || 'all';
            renderUserProducts(activeCategory, dashboardSearchInput.value);
        });
    }

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            categoryLinks.forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
            renderUserProducts(category, dashboardSearchInput.value);
            setTimeout(() => {
                const productArea = document.querySelector('.product-area');
                if (productArea) {
                    productArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 50);
        });
    });

    if(mainAddProductBtn) {
        mainAddProductBtn.addEventListener('click', () => {
            productForm.reset();
            document.getElementById('product-id').value = '';
            submitBtn.style.display = 'inline-block';
            editBtn.style.display = 'none';
            deleteBtn.style.display = 'none';
            openModal();
        });
    }

    if(closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeModal);
    }

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // --- START: FILE SIZE CHECK ---
    const imageFile = document.getElementById('product-image').files[0];
    const videoFile = document.getElementById('product-video').files[0];
    const pdfFile = document.getElementById('product-pdf').files[0];
    const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB limit

    if (imageFile && imageFile.size > maxSizeInBytes) {
        alert('حجم الصورة كبير جدًا! الرجاء اختيار صورة أصغر من 2 ميجابايت.');
        return; // Stop the submission
    }
    if (videoFile && videoFile.size > maxSizeInBytes) {
        alert('حجم الفيديو كبير جدًا! الرجاء اختيار فيديو أصغر من 2 ميجابايت.');
        return; // Stop the submission
    }
    if (pdfFile && pdfFile.size > maxSizeInBytes) {
        alert('حجم ملف الـ PDF كبير جدًا! الرجاء اختيار ملف أصغر من 2 ميجابايت.');
        return; // Stop the submission
    }
    // --- END: FILE SIZE CHECK ---

    const productId = document.getElementById('product-id').value;
    const userProducts = getUserProducts();
    const category = document.querySelector('.category-list a.active')?.dataset.category || 'all';

    if (productId) { // Editing
        const productIndex = userProducts.findIndex(p => p.id == productId);
        if (productIndex > -1) {
            const existingProduct = userProducts[productIndex];
            userProducts[productIndex] = {
                ...existingProduct,
                storeName: document.getElementById('store-name').value, name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value, price: document.getElementById('product-price').value,
                shippingCost: document.getElementById('shipping-cost').value,
                image: imageFile ? await readFileAsDataURL(imageFile) : existingProduct.image,
                video: videoFile ? await readFileAsDataURL(videoFile) : existingProduct.video,
                pdf: pdfFile ? await readFileAsDataURL(pdfFile) : existingProduct.pdf,
                category: category, status: 'pending'
            };
            alert('تم تعديل المنتج بنجاح.');
        }
    } else { // Adding
        const newProduct = {
            id: Date.now(), userEmail: currentUserEmail,
            storeName: document.getElementById('store-name').value, name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value, price: document.getElementById('product-price').value,
            shippingCost: document.getElementById('shipping-cost').value,
            image: await readFileAsDataURL(imageFile), video: await readFileAsDataURL(videoFile),
            pdf: await readFileAsDataURL(pdfFile), category: category, status: 'pending'
        };
        userProducts.push(newProduct);
        alert('تمت إضافة المنتج بنجاح.');
    }

    saveUserProducts(userProducts);
    closeModal();
    renderUserProducts(category, dashboardSearchInput.value);
});

    if(deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const productId = document.getElementById('product-id').value;
            if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                let userProducts = getUserProducts();
                userProducts = userProducts.filter(p => p.id != productId);
                saveUserProducts(userProducts);
                alert('تم حذف المنتج.');
                closeModal();
                renderUserProducts('all', dashboardSearchInput.value);
            }
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUserEmail');
            window.location.href = 'index.html';
        });
    }

    // --- SECTION 6: INITIAL PAGE RENDER ---
    // The first function call to display products when the page loads.
    renderUserProducts('all');
});

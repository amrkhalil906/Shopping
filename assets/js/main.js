/**
 * Gathers all ACCEPTED products from all users for the public store,
 * ensuring no duplicates from repeated users.
 * @returns {Array} A single array of all accepted products.
 */
function getAllAcceptedProducts() {
    const allUsers = JSON.parse(localStorage.getItem('userCredentials')) || [];
    let allProducts = [];
    const processedEmails = new Set(); // Use a Set to track processed emails

    allUsers.forEach(user => {
        // If we have already processed this email, skip to the next user
        if (processedEmails.has(user.email)) {
            return;
        }

        const userProductsKey = `userProducts_${user.email}`;
        const userProducts = JSON.parse(localStorage.getItem(userProductsKey)) || [];
        
        // Filter for ONLY accepted products for the public store
        const acceptedProducts = userProducts.filter(p => p.status === 'accepted');
        
        allProducts = allProducts.concat(acceptedProducts);
        
        // Add the email to the set of processed emails
        processedEmails.add(user.email);
    });
    return allProducts;
}
// --- ضع هذه الدالة في بداية ملف main.js ---
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
document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. DATA SIMULATION AND HELPERS
    // ----------------------------------------------------------------------

    const COMMISSION_RATE = 0.03; // نسبة عمولة ثابتة 3%

    const products = [
        { id: 1727280000000, name: 'سماعات أذن لاسلكية', price: 500, shippingCost: 30, image: 'https://via.placeholder.com/300x200/28a745/FFFFFF?text=Product+1', description: 'صوت عالي الجودة وتصميم مريح للارتداء اليومي.', category: 'electronics', ratings: [], comments: [] },
        { id: 1727278000000, name: 'ساعة ذكية رياضية', price: 1200, shippingCost: 30, image: 'https://via.placeholder.com/300x200/007bff/FFFFFF?text=Product+2', description: 'تتبع نشاطك البدني، نبضات القلب، والإشعارات.', category: 'electronics', ratings: [], comments: [] },
        { id: 3, name: 'شاحن محمول سريع', price: 300, shippingCost: 15, image: 'https://via.placeholder.com/300x200/ffc107/FFFFFF?text=Product+3', description: 'شاحن محمول بسعة كبيرة وشحن سريع لأجهزتك.', category: 'electronics', ratings: [], comments: [] },
        { id: 4, name: 'كاميرا ويب عالية الدقة', price: 750, shippingCost: 50, image: 'https://via.placeholder.com/300x200/17a2b8/FFFFFF?text=Product+4', description: 'مثالية للمكالمات المرئية وبث الفيديوهات بجودة 1080p.', category: 'electronics', ratings: [], comments: [] },
        { id: 5, name: 'طقم أواني طهي', price: 950, shippingCost: 40, image: 'https://via.placeholder.com/300x200/808080/FFFFFF?text=Product+5', description: 'طقم طهي عالي الجودة لجميع أنواع المواقد.', category: 'home', ratings: [], comments: [] },
        { id: 6, name: 'رواية الخيميائي', price: 65, shippingCost: 20, image: 'https://via.placeholder.com/300x200/556B2F/FFFFFF?text=Product+6', description: 'رواية شهيرة للمؤلف باولو كويلو.', category: 'books', ratings: [], comments: [] },
        { id: 7, name: 'قميص رجالي قطني', price: 200, shippingCost: 25, image: 'https://via.placeholder.com/300x200/000000/FFFFFF?text=Product+7', description: 'قميص أنيق ومريح مصنوع من القطن الناعم.', category: 'fashion', ratings: [], comments: [] },
        { id: 8, name: 'حذاء جري رياضي', price: 450, shippingCost: 35, image: 'https://via.placeholder.com/300x200/8B0000/FFFFFF?text=Product+8', description: 'حذاء خفيف ومناسب للجري والتمارين الرياضية.', category: 'sports', ratings: [], comments: [] },
        { id: 9, name: 'مجموعة مكياج متكاملة', price: 850, shippingCost: 30, image: 'https://via.placeholder.com/300x200/FFC0CB/000000?text=Product+9', description: 'مجموعة شاملة لجميع احتياجات المكياج.', category: 'beauty', ratings: [], comments: [] },
        { id: 10, name: 'لعبة سيارة سباق', price: 150, shippingCost: 40, image: 'https://via.placeholder.com/300x200/FFFF00/000000?text=Product+10', description: 'سيارة سباق تعمل بالتحكم عن بعد، ممتعة للأطفال.', category: 'toys', ratings: [], comments: [] },
        { id: 11, name: 'مجموعة قهوة مختصة', price: 250, shippingCost: 25, image: 'https://via.placeholder.com/300x200/A0522D/FFFFFF?text=Product+11', description: 'مجموعة تحتوي على أنواع مختارة من حبوب القهوة.', category: 'food', ratings: [], comments: [] },
        { id: 12, name: 'منظف داخلي للسيارة', price: 90, shippingCost: 15, image: 'https://via.placeholder.com/300x200/4682B4/FFFFFF?text=Product+12', description: 'منظف فعال لتنظيف مقاعد وأسطح السيارة.', category: 'automotive', ratings: [], comments: [] },
    ];

    // Auth Credentials (for multi-user system)
const userCredentials = JSON.parse(localStorage.getItem('userCredentials')) || [];
    // --- أضف هذا الكود ---
// حفظ قائمة المستخدمين المبدئية في LocalStorage إذا لم تكن موجودة
if (!localStorage.getItem('userCredentials')) {
    localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
}
    const adminEmail = 'admin@example.com';
    const adminPassword = '12345';

    // --- Helper Functions for Local Storage ---
    const getLoggedInUserEmail = () => localStorage.getItem('loggedInUserEmail');
    const getUserProducts = (email) => {
        if (!email) return [];
        const key = `userProducts_${email}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    };
    const saveUserProducts = (email, products) => {
        const key = `userProducts_${email}`;
        localStorage.setItem(key, JSON.stringify(products));
    };
    const getProductComments = (productId) => {
        const key = `productComments_${productId}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    };
    const saveProductComment = (productId, comment) => {
        const comments = getProductComments(productId);
        comments.push(comment);
        const key = `productComments_${productId}`;
        localStorage.setItem(key, JSON.stringify(comments));
    };

    // --- Metrics and Sorting Logic (Store Page) ---
    const getProductMetrics = (productId) => {
        const comments = getProductComments(productId);
        const totalRating = comments.reduce((sum, comment) => sum + parseInt(comment.rating), 0);
        const averageRating = comments.length > 0 ? (totalRating / comments.length) : 0;
        const commentCount = comments.length;
        const priorityScore = (averageRating * 1000) + (commentCount * 10);
        
        return { averageRating, commentCount, priorityScore };
    };

    const getMasterProductList = () => {
        const allUserProducts = userCredentials.flatMap(user => getUserProducts(user.email));
        return [...products, ...allUserProducts.filter(p => p.status === 'accepted')];
    };

    const sortProducts = (productsToSort) => {
        return productsToSort.map(product => {
            const metrics = getProductMetrics(product.id);
            return {
                ...product,
                ...metrics,
                recencyScore: product.id
            };
        }).sort((a, b) => {
            if (b.priorityScore !== a.priorityScore) {
                return b.priorityScore - a.priorityScore;
            }
            return b.recencyScore - a.recencyScore; 
        });
    };

    const formatDateFromId = (id) => {
        const date = new Date(id);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    
    // ----------------------------------------------------------------------
    // 2. DOM ELEMENTS & PAGE STATE
    // ----------------------------------------------------------------------
    const homeLink = document.getElementById('home-link');
    const myProductsLink = document.getElementById('my-products-link');
    const authLink = document.getElementById('auth-link');
    const adminLink = document.getElementById('admin-link');
    const storePage = document.getElementById('store-page');
    const dashboardPage = document.getElementById('dashboard-page');

    const productList = document.getElementById('product-list');
    const dashboardProductList = document.getElementById('dashboard-product-list'); 
    const cartIcon = document.querySelector('.cart-icon-container');
    const cartCount = document.querySelector('.cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeCartButton = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutButton = document.querySelector('.checkout-button');
    
    const authModal = document.getElementById('auth-modal');
    const emailSignupModal = document.getElementById('email-signup-modal');
    const emailSignupForm = document.getElementById('email-signup-form');
    const searchInput = document.getElementById('search-input');
    const productDetailsPage = document.getElementById('product-details-page');
    const productDetailsContent = document.getElementById('product-details-content');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const addProductModal = document.getElementById('add-product-modal');
    const productForm = document.getElementById('product-form');
    const submitBtn = productForm?.querySelector('.submit-btn');
    const editBtn = productForm?.querySelector('.edit-btn');
    const deleteBtn = productForm?.querySelector('.delete-btn');

    const paymentModal = document.getElementById('payment-modal');
    const closePaymentBtn = document.getElementById('close-payment-btn');
    const paymentButtons = document.querySelectorAll('.payment-btn');

    const themeToggleButton = document.getElementById('theme-toggle-btn'); 
    const topVisitorCount = document.getElementById('top-visitor-count');
    const topSellerCount = document.getElementById('top-seller-count');
    const topCurrentDate = document.getElementById('top-current-date');
    const topCurrentTime = document.getElementById('top-current-time');
    const dashboardSearchInput = document.getElementById('dashboard-search-input');
    if (dashboardSearchInput) {
    dashboardSearchInput.addEventListener('input', () => {
        const activeCategory = document.querySelector('#dashboard-page .category-list a.active')?.dataset.category || 'all';
        renderDashboardProducts(activeCategory, dashboardSearchInput.value);
    });
}

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentProductId = null;


    // ----------------------------------------------------------------------
    // 3. DARK MODE & METRICS LOGIC
    // ----------------------------------------------------------------------
    
    const applyTheme = (isDarkMode) => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        if (themeToggleButton) {
            themeToggleButton.textContent = isDarkMode ? '🌙' : '☀️';
        }
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    };

    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const isDarkMode = savedTheme ? (savedTheme === 'dark') : prefersDark;
        
        applyTheme(isDarkMode);
    };

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const isCurrentlyDark = document.body.classList.contains('dark-mode');
            applyTheme(!isCurrentlyDark);
        });
    }

    function updateClock() {
        const now = new Date();
        
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const timeString = now.toLocaleTimeString('en-US', timeOptions); 
        if (topCurrentTime) topCurrentTime.textContent = timeString;

        const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const dateString = now.toLocaleDateString('ar-SA', dateOptions).replace(/\//g, '-');
        if (topCurrentDate) topCurrentDate.textContent = dateString;

        setTimeout(updateClock, 1000); 
    }

    function initializeMetrics() {
        // 1. Seller Count 
        const sellerCount = userCredentials.filter(u => u.email !== adminEmail).length;
        if (topSellerCount) topSellerCount.textContent = sellerCount;

        // 2. Visitor Count (Mock Logic)
        let visitorCount = parseInt(localStorage.getItem('visitorCount')) || 0;
        
        if (!sessionStorage.getItem('isFirstVisit')) {
            visitorCount += 1; 
            localStorage.setItem('visitorCount', visitorCount);
            sessionStorage.setItem('isFirstVisit', 'true');
        }
        
        const baseVisitorCount = 5000;
        if (topVisitorCount) topVisitorCount.textContent = (baseVisitorCount + visitorCount).toLocaleString('en-US');
    }

    // ----------------------------------------------------------------------
    // 4. RENDER AND VIEW FUNCTIONS
    // ----------------------------------------------------------------------
    
    const showPage = (pageId) => {
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('hidden');
        });
        document.getElementById(pageId).classList.remove('hidden');
    };

    const toggleAuthUI = (isLoggedIn) => {
        if (isLoggedIn) {
            authLink.textContent = 'تسجيل الخروج';
            authLink.id = 'logout-link';
            myProductsLink.classList.remove('hidden');
        } else {
            authLink.textContent = 'تسجيل بائع جديد';
            authLink.id = 'auth-link';
            myProductsLink.classList.add('hidden');
        }
    };
    
    // Function that calls the rendering function with the current search term and category
    const searchAndRenderProducts = () => {
        const searchTerm = searchInput.value;
        const activeCategoryLink = document.querySelector('#store-page .category-list a.active');
        const category = activeCategoryLink ? activeCategoryLink.dataset.category : 'all';

        renderStoreProducts(category, searchTerm);
    };

    // Render Products for Store Page (Updated for Sorting and Search)
    const renderStoreProducts = (category = 'all', searchTerm = '') => {
        if (!productList) return;
        productList.innerHTML = '';
        
    const masterList = getAllAcceptedProducts();
        
        // 1. Filter by Search Term
        let filteredProducts = masterList.filter(product => {
            const query = searchTerm.toLowerCase();
            const searchableText = [
                product.name,
                product.description,
                product.category,
                product.storeName,
                product.id.toString(), 
                (product.price || '').toString(), 
                (product.shippingCost || '').toString()
            ].join(' ').toLowerCase();

            return searchableText.includes(query);
        });

        // 2. Filter by Category
        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        // 3. Apply Sorting
        const sortedProducts = sortProducts(filteredProducts); 

        if (sortedProducts.length === 0) {
            productList.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1 / -1;">لا توجد منتجات مطابقة لعملية البحث.</p>';
            return;
        }

        sortedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.productId = product.id; 
            const imageUrl = product.image || `https://via.placeholder.com/300x200/999/FFFFFF?text=${product.name}`;
            
            // Get rating metrics for display
            const metrics = getProductMetrics(product.id);
            const displayRating = metrics.averageRating.toFixed(1);
            const isFiveStar = metrics.averageRating >= 4.95 && metrics.commentCount > 0;
            const ratingStars = '★'.repeat(Math.round(metrics.averageRating)) + '☆'.repeat(5 - Math.round(metrics.averageRating));
            
            const releaseDate = formatDateFromId(product.id);
            
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    
                    <div class="rating-card-display">
                        <span class="rating-stars">${ratingStars}</span> 
                        (${displayRating})
                        ${isFiveStar ? '<span class="golden-star">⭐</span>' : ''}
                    </div>
                    
                    <p class="product-release-date">تاريخ النزول: ${releaseDate}</p>
                    
                    <p>${product.description ? product.description.substring(0, 40) + '...' : ''}</p>
                    ${product.storeName ? `<p class="store-name-display">${product.storeName}</p>` : ''}
                    <div class="product-price">${product.price} جنيه</div>
                    <button class="add-to-cart-btn" data-id="${product.id}">أضف إلى السلة</button>
                </div>
            `;
            productCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart-btn')) {
                    displayProductDetails(product);
                }
            });
            productList.appendChild(productCard);
        });
    };

    // Render Products for Dashboard (Newest First)
const renderDashboardProducts = (category = 'all', searchTerm = '') => {
    if (!dashboardProductList) return;
    dashboardProductList.innerHTML = '';
    const currentUserEmail = getLoggedInUserEmail();
    let currentUserProducts = getUserProducts(currentUserEmail);

    // 1. Filter by Search Term
    let filteredProducts = currentUserProducts.filter(product => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true; // Show all if search is empty
        const searchableText = [product.name, product.description, product.category, product.price.toString()].join(' ').toLowerCase();
        return searchableText.includes(query);
    });

    // 2. Filter by Category
    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // 3. Sorting
    filteredProducts.sort((a, b) => b.id - a.id);

    if (filteredProducts.length === 0) {
        dashboardProductList.innerHTML = '<p style="text-align: center; color: #888;">لا توجد منتجات مطابقة لعملية البحث أو في هذا القسم.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        let statusIndicator;
        if (product.status === 'rejected') {
            statusIndicator = `<span style="position: absolute; top: 10px; left: 10px; background: #e74c3c; color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 0.9em;">مرفوض</span>`;
        } else if (product.status === 'pending') {
            statusIndicator = `<span style="position: absolute; top: 10px; left: 10px; background: #ffc107; color: #333; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 0.9em;">قيد المراجعة</span>`;
        } else {
            statusIndicator = `<span style="position: absolute; top: 10px; left: 10px; background: #28a745; color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 0.9em;">مقبول</span>`;
        }

        const imageUrl = product.image || `https://via.placeholder.com/300x200/999/FFFFFF?text=${product.name}`;
        const releaseDate = formatDateFromId(product.id);

productCard.innerHTML = `
    ${statusIndicator}
    <img src="${imageUrl}" alt="${product.name}" loading="lazy">
    <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-release-date">تاريخ الإضافة: ${releaseDate}</p>
        <p>${product.description ? product.description.substring(0, 40) + '...' : ''}</p>
        ${product.storeName ? `<p class="store-name-display">${product.storeName}</p>` : ''}

        <div class="product-price">${product.price} جنيه</div>
        </div>
`;

        productCard.addEventListener('click', () => {
            document.getElementById('product-id').value = product.id;
            document.getElementById('store-name').value = product.storeName || '';
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            document.getElementById('shipping-cost').value = product.shippingCost || '';

            document.querySelectorAll('#dashboard-page .category-list a').forEach(link => link.classList.remove('active'));
            const categoryLink = document.querySelector(`#dashboard-page .category-list a[data-category="${product.category}"]`);
            if (categoryLink) categoryLink.classList.add('active');

            submitBtn.classList.add('hidden');
            editBtn.classList.remove('hidden');
            deleteBtn.classList.remove('hidden');
            addProductModal.style.display = 'flex';
        });

        dashboardProductList.appendChild(productCard);
    });
};

    // Display Product Details Page
    const displayProductDetails = (product) => {
        currentProductId = product.id; // Set current product ID
        showPage('product-details-page');

        // Function to calculate average rating
        const comments = getProductComments(product.id);
        const totalRating = comments.reduce((sum, comment) => sum + parseInt(comment.rating), 0);
        const averageRating = comments.length > 0 ? (totalRating / comments.length).toFixed(1) : 'جديد';
        const ratingStars = '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating));

        // --- Dynamic media content generation ---
        let mediaContent = '';
        if (product.shippingCost) {
             mediaContent += `<p>🚚 **تكلفة الشحن:** ${product.shippingCost} جنيه</p>`;
        }
        if (product.storeName) {
             mediaContent += `<p>🏬 **اسم المتجر:** ${product.storeName}</p>`;
        }
        if (product.video) {
            mediaContent += `<p>🎬 **فيديو المنتج:** <a href="${product.video}" target="_blank">شاهد الفيديو</a></p>`;
        }
        if (product.pdf) {
            mediaContent += `<p>📄 **ملف تفاصيل (PDF):** <a href="${product.pdf}" target="_blank">تنزيل الملف</a></p>`;
        }
        if (product.audio) {
            mediaContent += `<p>🔊 **مراجعة صوتية:** <a href="${product.audio}" target="_blank">استمع للمراجعة</a></p>`;
        }
        
        const releaseDate = formatDateFromId(product.id);
        mediaContent += `<p>🗓️ **تاريخ النزول:** ${releaseDate}</p>`;
        // ---------------------------------------------

        productDetailsContent.innerHTML = `
            <div class="product-details-grid">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <div class="rating-display">
                        <span class="rating-stars" style="color: gold;">${ratingStars}</span> 
                        <span class="rating-average">(${averageRating} / 5) - ${comments.length} تقييم</span>
                    </div>
                    <div class="price-info">${product.price} جنيه</div>
                    <p class="product-description">${product.description}</p>
                    
                    ${mediaContent ? `<div class="product-media-details"><h4>تفاصيل إضافية:</h4>${mediaContent}</div>` : ''}
                    
                    <button class="add-to-cart-btn" data-id="${product.id}">أضف إلى السلة</button>
                </div>
            </div>
        `;
        renderComments(product.id);
    };

    // Render Comments
    const renderComments = (productId) => {
        commentsList.innerHTML = '';
        const comments = getProductComments(productId);

        if (comments.length === 0) {
            commentsList.innerHTML = '<p>لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>';
            return;
        }

        comments.forEach(comment => {
            const commentCard = document.createElement('div');
            commentCard.classList.add('comment-card');
            commentCard.innerHTML = `
                <p class="comment-rating">التقييم: ${'★'.repeat(comment.rating)}</p>
                <p class="comment-text">${comment.text}</p>
                <p class="comment-author">بواسطة: ${comment.email}</p>
            `;
            commentsList.appendChild(commentCard);
        });
    };

    // Handle Comment Submission
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rating = document.getElementById('rating-stars').value;
            const text = document.getElementById('comment-text').value;
            const userEmail = getLoggedInUserEmail() || 'زائر';

            if (!currentProductId) {
                alert('حدث خطأ: لا يوجد منتج محدد للتعليق عليه.');
                return;
            }

            const newComment = {
                id: Date.now(),
                rating: parseInt(rating),
                text: text,
                email: userEmail
            };

            saveProductComment(currentProductId, newComment);
            alert('تم إرسال تقييمك بنجاح! شكراً لك.');
            commentForm.reset();
            
            const allProducts = getMasterProductList();

            const currentProduct = allProducts.find(p => p.id == currentProductId);
            if(currentProduct) {
                 displayProductDetails(currentProduct); // Re-render details to show new comment
            } else {
                console.error("Product not found after comment submission.");
            }
        });
    }


    // --- Cart Functions ---
    const updateCart = () => {
        if (!cartCount || !cartItemsContainer) return;

        cartCount.textContent = cart.length;
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalShipping = 0;
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class="item-info">
                    <p>${item.name}</p>
                    <div class="item-quantity">
                        <button class="remove-from-cart-btn" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="add-more-btn" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="item-price">${item.price * item.quantity} جنيه</div>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += item.price * item.quantity;
            totalShipping += (item.shippingCost || 0) * item.quantity;
        });
        
        // Remove old cart summary before adding the new one
        const oldSummary = cartModal.querySelector('.cart-total-details');
        if (oldSummary) {
            oldSummary.remove();
        }

        // Display Subtotals and Grand Total
        const subtotal = total;
        const grandTotal = subtotal + totalShipping;
        
        // حساب عمولة الموقع للبائع (لا تظهر للعميل)
        const commissionAmount = total * COMMISSION_RATE;

        const cartSummary = document.createElement('div');
        cartSummary.classList.add('cart-total-details');
        cartSummary.innerHTML = `
            <p><strong>المجموع الفرعي للمنتجات:</strong> <span>${subtotal.toFixed(2)} جنيه</span></p>
            <p><strong>تكلفة الشحن:</strong> <span>${totalShipping.toFixed(2)} جنيه</span></p>
            <p style="font-size: 0.8em; color: #888; border-top: 1px dashed #ddd; padding-top: 5px;">
                (عمولة الموقع المحتسبة: ${commissionAmount.toFixed(2)} جنيه)
            </p>
            <p><strong>الإجمالي النهائي المطلوب دفعه:</strong> <span>${grandTotal.toFixed(2)} جنيه</span></p>
        `;
        // Find the appropriate place to inject the summary (before the final checkout button/total)
        const totalContainer = cartModal.querySelector('.cart-total');
        if (totalContainer) {
            totalContainer.before(cartSummary);
        }

        cartTotalPrice.textContent = `${grandTotal.toFixed(2)} جنيه`; // Update main total placeholder
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #888;">سلة المشتريات فارغة.</p>';
            // Also ensure total is cleared when empty
            if (totalContainer) {
                totalContainer.before(cartSummary);
            }
        }
        
        // Save cart to local storage
        localStorage.setItem('cart', JSON.stringify(cart));
    };
    
    const addToCart = (productToAdd) => {
        const existingItem = cart.find(item => item.id == productToAdd.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        updateCart();
    };

    // ----------------------------------------------------------------------
    // 6. EVENT LISTENERS
    // ----------------------------------------------------------------------

    document.addEventListener('click', (e) => {
        // Toggle Pages
        if (e.target.id === 'home-link') {
            e.preventDefault();
            showPage('store-page');
            renderStoreProducts('all');
        }
        if (e.target.id === 'my-products-link') {
            e.preventDefault();
            if (localStorage.getItem('isLoggedIn') === 'true') {
                 showPage('dashboard-page');
                 renderDashboardProducts('all');
            } else {
                 alert('يرجى تسجيل الدخول أولاً للوصول إلى لوحة التحكم.');
                 authModal.style.display = 'flex';
            }
        }
        // Auth/Logout Link
        if (e.target.id === 'auth-link') {
            e.preventDefault();
            authModal.style.display = 'flex';
        }
        if (e.target.id === 'logout-link') {
            e.preventDefault();
            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('loggedInUserEmail');
            toggleAuthUI(false);
            showPage('store-page');
            renderStoreProducts('all');
        }
        if (e.target.id === 'admin-link') {
            e.preventDefault();
            authModal.style.display = 'flex';
        }

        // Cart Modal
        if (e.target.closest('.cart-icon-container')) {
            updateCart(); // Ensure cart is up to date before showing
            cartModal.style.display = 'flex';
        }
        if (e.target.id === 'close-cart-btn' || e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target.classList.contains('checkout-button')) {
            if (cart.length > 0) {
                cartModal.style.display = 'none';
                paymentModal.style.display = 'flex';
            } else {
                alert('سلة المشتريات فارغة. يرجى إضافة منتجات أولاً.');
            }
        }
        if (e.target.id === 'close-payment-btn' || e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }

        // Auth Modals
        if (e.target.id === 'close-auth-btn' || e.target === authModal) {
            authModal.style.display = 'none';
        }
        if (e.target.id === 'show-email-form-btn') {
            authModal.style.display = 'none';
            emailSignupModal.style.display = 'flex';
        }
        if (e.target.id === 'close-email-btn' || e.target === emailSignupModal) {
            emailSignupModal.style.display = 'none';
        }
        if (e.target.id === 'go-back-to-register') {
            e.preventDefault();
            emailSignupModal.style.display = 'none';
            authModal.style.display = 'flex';
        }
        
        // Add Product Modal
        if (e.target.classList.contains('add-product-btn')) {
            addProductModal.style.display = 'flex';
            productForm.reset();
            submitBtn.classList.remove('hidden');
            editBtn.classList.add('hidden');
            deleteBtn.classList.add('hidden');
            document.getElementById('product-id').value = ''; // Clear ID for new product
        }
        if (e.target.id === 'close-product-modal-btn' || e.target === addProductModal) {
            addProductModal.style.display = 'none';
        }

        // Add to Cart from Store Page or Details Page
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = e.target.dataset.id || currentProductId; 
            
            let productToAdd = products.find(p => p.id == productId);
            if (!productToAdd) {
                const allUserProducts = userCredentials.flatMap(user => getUserProducts(user.email));
                productToAdd = allUserProducts.find(p => p.id == productId && p.status === 'accepted');
            }
            if (productToAdd) {
                addToCart(productToAdd);
                alert(`تم إضافة ${productToAdd.name} إلى السلة!`);
            }
        }

        // Category Links
// ====================================================================
// === FINAL FIX FOR CATEGORY LINKS IN main.js ========================
// ====================================================================

// Define specific variables for each category list
const storeCategoryLinks = document.querySelectorAll('#store-page .category-list a');
const dashboardCategoryLinks = document.querySelectorAll('#dashboard-page .category-list a');

// Add a separate listener for the STORE page categories
// Add a separate listener for the STORE page categories (with scroll fix)
storeCategoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.dataset.category;

        storeCategoryLinks.forEach(item => item.classList.remove('active'));
        e.target.classList.add('active');

        renderStoreProducts(category, searchInput.value); // Renders store products

        // --- START: ADD THE MISSING SCROLL CODE ---
        setTimeout(() => {
            const productArea = document.querySelector('#store-page .product-area');
            if (productArea) {
                productArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
        // --- END: ADD THE MISSING SCROLL CODE ---
    });
});

// Add a separate listener for the DASHBOARD page categories (with the scroll fix)
// Listener for DASHBOARD page categories (with the scroll fix)
dashboardCategoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.dataset.category;

        dashboardCategoryLinks.forEach(item => item.classList.remove('active'));
        e.target.classList.add('active');

        renderDashboardProducts(category, dashboardSearchInput.value);

        setTimeout(() => {
            const productArea = document.querySelector('#dashboard-page .product-area');
            
            // --- هذا هو السطر الحاسم ---
            console.log("النتيجة:", productArea); 
            // --------------------------

            if (productArea) {
                productArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    });
});

        // Add/Remove item from cart
        if (e.target.classList.contains('add-more-btn')) {
            const itemId = e.target.dataset.id;
            const item = cart.find(i => i.id == itemId);
            if(item) {
                item.quantity++;
            }
            updateCart();
        }
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const itemId = e.target.dataset.id;
            const itemIndex = cart.findIndex(i => i.id == itemId);
            if (itemIndex > -1) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity--;
                } else {
                    cart.splice(itemIndex, 1);
                }
            }
            updateCart();
        }

        // Handle Payment Buttons
        if (e.target.closest('.payment-btn')) {
            const method = e.target.closest('.payment-btn').dataset.method;
            if (method) {
                alert(`تم اختيار طريقة الدفع: ${method}. سيتم إتمام العملية.`);
                cart = [];
                updateCart();
                paymentModal.style.display = 'none';
                showPage('store-page'); // Return to store page after purchase
            }
        }

        // Back to products button
        if (e.target.id === 'back-to-products') {
            showPage('store-page');
        }
    });

    // Final Fix: Attach search listener
    if (searchInput) {
        searchInput.addEventListener('input', searchAndRenderProducts);
    }

    // Handle Form Submissions
    emailSignupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-input').value.trim(); 
        const password = document.getElementById('password-input').value.trim(); 
        const paymentMethod = document.getElementById('payment-method-select').value;
        const paymentAccount = document.getElementById('payment-account-input').value.trim();


        const user = userCredentials.find(u => u.email === email && u.password === password);

        if (user) {
            // Success: User Login 
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('isAdmin', 'false');
            localStorage.setItem('loggedInUserEmail', user.email);
            toggleAuthUI(true);
            authModal.style.display = 'none';
            emailSignupModal.style.display = 'none';
            showPage('dashboard-page');
            renderDashboardProducts('all');
        } else if (email === adminEmail && password === adminPassword) {
            // Admin Login
            localStorage.setItem('isAdmin', 'true');
            window.location.href = 'admin.html';
        } else {
             // Handle New User Registration (Simulated)
            if (userCredentials.find(u => u.email === email)) {
                alert('البريد الإلكتروني مسجل بالفعل. يرجى مراجعة كلمة المرور.');
                return;
            }
            if (!paymentMethod || !paymentAccount) {
                alert('يرجى ملء جميع حقول الدفع لإنشاء حساب بائع.');
                return;
            }

            // Simulated Registration
// --- استبدل السطر القديم بهذا الكود ---

// تحديث قائمة المستخدمين في LocalStorage
const allUsers = JSON.parse(localStorage.getItem('userCredentials')) || [];
allUsers.push({ email, password, paymentMethod, paymentAccount });
localStorage.setItem('userCredentials', JSON.stringify(allUsers));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUserEmail', email);
            toggleAuthUI(true);
            alert('تم تسجيل حساب بائع جديد بنجاح!');
            emailSignupModal.style.display = 'none';
            showPage('dashboard-page');
            renderDashboardProducts('all');
        }
    });

if (productForm) {
    productForm.addEventListener('submit', async (e) => { // لاحظ كلمة async
        e.preventDefault();

        const currentUserEmail = getLoggedInUserEmail();
        if (!currentUserEmail) {
            alert("يجب تسجيل الدخول أولاً لإضافة منتج.");
            return;
        }

        const category = document.querySelector('#dashboard-page .category-list a.active')?.dataset.category || 'all';

        const imageFile = document.getElementById('product-image').files[0];
        const videoFile = document.getElementById('product-video').files[0];
        const audioFile = document.getElementById('product-audio').files[0];
        const pdfFile = document.getElementById('product-pdf').files[0];

        const newProduct = {
            id: Date.now(),
            userEmail: currentUserEmail,
            storeName: document.getElementById('store-name').value,
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: document.getElementById('product-price').value,
            shippingCost: document.getElementById('shipping-cost').value,
            category: category,
            status: 'pending',
            image: await readFileAsDataURL(imageFile),
            video: await readFileAsDataURL(videoFile),
            audio: await readFileAsDataURL(audioFile),
            pdf: await readFileAsDataURL(pdfFile)
        };

        const currentUserProducts = getUserProducts(currentUserEmail);
        currentUserProducts.push(newProduct);
        saveUserProducts(currentUserEmail, currentUserProducts);

        alert('تمت إضافة المنتج بنجاح وسيتم مراجعته.');
        productForm.reset();

        // السطر الذي تم تعديله
        document.getElementById('add-product-modal').style.display = 'none'; 

        renderDashboardProducts(category);
    });
}

    // Dashboard Actions
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const productId = document.getElementById('product-id').value;
            const currentUserEmail = getLoggedInUserEmail();
            const currentUserProducts = getUserProducts(currentUserEmail);
            const productIndex = currentUserProducts.findIndex(p => p.id == productId);
            if (productIndex > -1) {
                const currentProduct = currentUserProducts[productIndex];
                
                const getFileUrlForUpdate = (id, existingUrl) => {
                    const fileInput = document.getElementById(id);
                    return fileInput && fileInput.files[0] ? URL.createObjectURL(fileInput.files[0]) : existingUrl;
                }
                
                const activeCategoryLink = document.querySelector('#dashboard-page .category-list a.active');
                const category = activeCategoryLink ? activeCategoryLink.dataset.category : currentProduct.category;

                currentUserProducts[productIndex] = {
                    ...currentProduct,
                    storeName: document.getElementById('store-name').value,
                    name: document.getElementById('product-name').value,
                    description: document.getElementById('product-description').value,
                    price: document.getElementById('product-price').value,
                    shippingCost: document.getElementById('shipping-cost').value,
                    image: getFileUrlForUpdate('product-image', currentProduct.image),
                    video: getFileUrlForUpdate('product-video', currentProduct.video),
                    audio: getFileUrlForUpdate('product-audio', currentProduct.audio),
                    pdf: getFileUrlForUpdate('product-pdf', currentProduct.pdf),
                    category: category,
                    status: 'pending' // Reset status upon edit
                };
                saveUserProducts(currentUserEmail, currentUserProducts);
                alert('تم تعديل المنتج بنجاح! (في انتظار الموافقة)');
                addProductModal.style.display = 'none';
                renderDashboardProducts('all');
            }
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const productId = document.getElementById('product-id').value;
            const currentUserEmail = getLoggedInUserEmail();
            let currentUserProducts = getUserProducts(currentUserEmail);
            currentUserProducts = currentUserProducts.filter(p => p.id != productId);
            saveUserProducts(currentUserEmail, currentUserProducts);
            alert('تم حذف المنتج بنجاح!');
            addProductModal.style.display = 'none';
            renderDashboardProducts('all');
        });
    }

    // Initial Load
    initializeTheme(); // Apply saved theme preference or system preference
    updateClock(); // Start the clock
    initializeMetrics(); // Start metrics counter

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    toggleAuthUI(isLoggedIn);
    showPage('store-page');
    updateCart(); 
    renderStoreProducts('all');
});

// --- JavaScript for Hamburger Menu ---

// Get the button and the navigation links container
const hamburgerMenu = document.getElementById('hamburger-menu');
const navLinks = document.getElementById('nav-links');

// Add a click event listener to the button
hamburgerMenu.addEventListener('click', () => {
    // Toggle the 'active' class on the nav-links container
    navLinks.classList.toggle('active');
    // --- Add this code to automatically close the menu on link click ---
if (navLinks) {
    navLinks.addEventListener('click', (e) => {
        // Check if the clicked item is a link (an A tag)
        if (e.target.tagName === 'A') {
            // Remove the 'active' class to trigger the closing animation
            navLinks.classList.remove('active');
        }
    });
}
});
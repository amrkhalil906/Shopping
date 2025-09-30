// File: assets/js/product-manager.js

// A unique key to store products in LocalStorage
const PRODUCT_STORAGE_KEY = 'myE-commerceSiteProducts';

/**
 * Reads all products from LocalStorage.
 * @returns {Array} An array of product objects.
 */
function getProducts() {
    const productsJSON = localStorage.getItem(PRODUCT_STORAGE_KEY);
    // If nothing is found, return an empty array
    return productsJSON ? JSON.parse(productsJSON) : [];
}

/**
 * Saves an array of products to LocalStorage.
 * @param {Array} products The array of products to save.
 */
function saveProducts(products) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

/**
 * Adds a single new product and saves the updated list.
 * @param {Object} newProduct The new product object to add.
 */
function addProduct(newProduct) {
    const allProducts = getProducts();
    allProducts.push(newProduct);
    saveProducts(allProducts);
}

// You can add more functions here later, like deleteProduct(productId), etc.
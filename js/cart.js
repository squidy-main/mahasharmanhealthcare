// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add cart icon to navigation
    addCartIconToNavbar();
    
    // Update cart count
    updateCartCount();
    
    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productData = {
                id: productCard.dataset.productId || generateProductId(productCard),
                name: productCard.querySelector('h3').textContent,
                description: productCard.querySelector('p').textContent,
                price: parseFloat(productCard.querySelector('.price').textContent.replace('₹', '')),
                image: productCard.querySelector('img').src,
                quantity: 1
            };
            
            addToCart(productData);
        });
    });

    // Initialize cart page functionality if we're on the cart page
    if (window.location.pathname.includes('cart.html')) {
        // Set up event delegation for cart controls
        setupCartEventDelegation();
        
        // Initialize the cart
        initializeCart();
        
        // Make the cart functions globally available
        window.updateQuantity = updateQuantity;
        window.updateQuantityInput = updateQuantityInput;
        window.removeItem = removeItem;
        window.checkout = checkout;
    }
});

// Add cart icon to navbar
function addCartIconToNavbar() {
    // Check if cart icon already exists
    if (document.querySelector('.cart-icon')) {
        return; // Cart icon already exists, no need to add it again
    }
    
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (!navbarCollapse) return;
    
    // Create cart icon element
    const cartIcon = document.createElement('a');
    cartIcon.href = 'cart.html';
    cartIcon.className = 'cart-icon';
    cartIcon.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count" id="cartCount">0</span>
    `;
    
    // Add cart icon styles if they don't exist
    if (!document.querySelector('style#cart-icon-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'cart-icon-styles';
        styleElement.textContent = `
            .cart-icon {
                position: relative;
                margin-left: 15px;
                display: flex;
                align-items: center;
                color: var(--sage);
                text-decoration: none;
                font-size: 1.2rem;
            }
            .cart-icon:hover {
                color: var(--dark-sage);
            }
            .cart-count {
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: var(--sage);
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: none;
                font-size: 12px;
                text-align: center;
                line-height: 20px;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Append cart icon to navbar
    navbarCollapse.appendChild(cartIcon);
}

// Generate a unique ID for products that don't have one
function generateProductId(productCard) {
    const name = productCard.querySelector('h3').textContent;
    return 'product_' + name.toLowerCase().replace(/\s+/g, '_');
}

// Add product to cart
function addToCart(product) {
    // Get current cart or initialize empty array
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex > -1) {
        // Increment quantity if product already in cart
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add new product to cart
        cart.push(product);
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showAddToCartMessage(product.name);
}

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart count in navbar
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'inline-block' : 'none';
    }
}

// Show message when product is added to cart
function showAddToCartMessage(productName) {
    // Create toast element if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toastId = 'cartToast' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Added to Cart</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${productName} has been added to your cart.
                <div class="mt-2 pt-2 border-top">
                    <a href="cart.html" class="btn btn-primary btn-sm">View Cart</a>
                </div>
            </div>
        </div>
    `;
    
    toastContainer.innerHTML += toastHTML;
    
    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Set up event delegation for cart controls
function setupCartEventDelegation() {
    // Get the cart container
    const cartContainer = document.getElementById('cartItemsContainer');
    if (!cartContainer) return;
    
    // Add event listener to the cart container that will handle all clicks within it
    cartContainer.addEventListener('click', function(event) {
        // Handle quantity decrease button
        if (event.target.classList.contains('quantity-btn-decrease')) {
            const index = parseInt(event.target.dataset.index);
            updateQuantity(index, -1);
            return;
        }
        
        // Handle quantity increase button
        if (event.target.classList.contains('quantity-btn-increase')) {
            const index = parseInt(event.target.dataset.index);
            updateQuantity(index, 1);
            return;
        }
        
        // Handle remove item button
        if (event.target.classList.contains('remove-item-btn') || 
            (event.target.parentElement && event.target.parentElement.classList.contains('remove-item-btn'))) {
            const button = event.target.classList.contains('remove-item-btn') ? 
                           event.target : event.target.parentElement;
            const index = parseInt(button.dataset.index);
            removeItem(index);
            return;
        }
    });
    
    // Add event listener for quantity input changes
    cartContainer.addEventListener('change', function(event) {
        if (event.target.classList.contains('quantity-input')) {
            const index = parseInt(event.target.dataset.index);
            updateQuantityInput(index, event.target.value);
        }
    });
    
    // Add event listener to checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
}

// Functions for cart page
function initializeCart() {
    loadCart();
}

function loadCart() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cartItemsContainer');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!cartContainer || !emptyCartMessage) return; // Not on cart page
    
    // If cart is empty, show empty cart message
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        if (checkoutBtn) checkoutBtn.disabled = true;
        updateCartSummary(0, 0, 0, 0);
        return;
    }
    
    // Hide empty cart message and enable checkout button
    emptyCartMessage.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    // Clear cart container
    cartContainer.innerHTML = '';
    
    // Calculate totals
    let subtotal = 0;
    
    // Add each item to cart
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemHTML = `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <h5>${item.name}</h5>
                        <p class="text-muted mb-0">${item.description}</p>
                    </div>
                    <div class="col-md-2">
                        <span class="price">₹${item.price}</span>
                    </div>
                    <div class="col-md-2">
                        <div class="quantity-control">
                            <button class="quantity-btn quantity-btn-decrease" data-index="${index}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                            <button class="quantity-btn quantity-btn-increase" data-index="${index}">+</button>
                        </div>
                    </div>
                    <div class="col-md-1">
                        <span class="item-total">₹${itemTotal}</span>
                    </div>
                    <div class="col-md-1 text-end">
                        <button class="btn btn-sm btn-outline-danger remove-item-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        cartContainer.innerHTML += cartItemHTML;
    });
    
    // Calculate shipping, tax, and total
    const shipping = subtotal > 0 ? 50 : 0;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;
    
    // Update cart summary
    updateCartSummary(subtotal, shipping, tax, total);
}

function updateCartSummary(subtotal, shipping, tax, total) {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (!subtotalElement || !shippingElement || !taxElement || !totalElement) return; // Not on cart page
    
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    shippingElement.textContent = `₹${shipping.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
}

function updateQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity = Math.max(1, cart[index].quantity + change);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function updateQuantityInput(index, value) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity = Math.max(1, parseInt(value) || 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function checkout() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items to your cart before checkout.');
        return;
    }
    
    // Show checkout confirmation
    if (confirm('Proceed to checkout with the items in your cart?')) {
        // Here you would typically redirect to a checkout page or process the order
        alert('Thank you for your order! Your items will be processed shortly.');
        
        // Clear the cart after successful checkout
        localStorage.removeItem('cart');
        
        // Reload the cart display
        loadCart();
        
        // Update cart count in navbar
        updateCartCount();
    }
} 
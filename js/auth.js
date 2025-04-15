// API Configuration
const API_URL = 'http://localhost:5000/api';

// Authentication Status
const isAuthenticated = () => {
    const token = getToken();
    const user = getUser();
    return !!(token && user);
};

// Update Navigation Based on Auth Status
const updateNavigation = () => {
    console.log('Updating navigation...');
    const authNav = document.querySelector('.auth-nav');
    const user = getUser();
    console.log('Current user:', user);
    console.log('Auth nav element:', authNav);

    if (isAuthenticated() && authNav) {
        console.log('User is authenticated, updating nav...');
        authNav.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="profile-icon-wrapper me-2">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <span>${user.firstName}</span>
                    <i class="fas fa-chevron-down ms-2"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>Profile</a></li>
                    <li><a class="dropdown-item" href="orders.html"><i class="fas fa-shopping-bag me-2"></i>Orders</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="handleSignOut(event)"><i class="fas fa-sign-out-alt me-2"></i>Sign Out</a></li>
                </ul>
            </li>
        `;
    } else if (authNav) {
        console.log('User is not authenticated or nav not found');
        authNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="signin.html">
                    <i class="fas fa-user-plus"></i>
                    <span class="d-lg-none ms-2">Sign In</span>
                </a>
            </li>
        `;
    }
};

// Handle Sign Out
const handleSignOut = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showSuccess('Successfully signed out!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
};

// Utility Functions
const setToken = (token) => {
    localStorage.setItem('token', token);
};

const getToken = () => {
    return localStorage.getItem('token');
};

const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Show error message
const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const form = document.querySelector('form');
    form.parentNode.insertBefore(errorDiv, form.nextSibling);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
};

// Show success message
const showSuccess = (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show mt-3';
    successDiv.role = 'alert';
    successDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const form = document.querySelector('form');
    form.parentNode.insertBefore(successDiv, form.nextSibling);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
};

// Handle Sign In
const handleSignIn = async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    try {
        const response = await fetch(`${API_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to sign in');
        }

        setToken(data.token);
        setUser(data.user);
        console.log('Login successful, user data:', data.user);

        if (rememberMe) {
            // Additional remember me logic can be added here
        }

        showSuccess('Successfully signed in!');
        
        // Update navigation immediately
        updateNavigation();
        
        // Redirect to home page after successful login
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    }
};

// Handle Sign Up
const handleSignUp = async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    // Validate terms acceptance
    if (!terms) {
        showError('Please accept the Terms of Service and Privacy Policy');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to sign up');
        }

        setToken(data.token);
        setUser(data.user);

        showSuccess('Account created successfully!');
        
        // Redirect to home page after successful registration
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        showError(error.message);
    }
};

// Password visibility toggle
const setupPasswordToggle = () => {
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const password = this.parentElement.querySelector('input');
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
};

// Add this function to get cart count
const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
};

// Initialize forms
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    console.log('Current auth status:', isAuthenticated());
    console.log('Current user:', getUser());
    
    // Update navigation based on auth status
    updateNavigation();

    // Check if we're on a protected page
    if (window.location.pathname.includes('profile.html') || 
        window.location.pathname.includes('orders.html')) {
        if (!isAuthenticated()) {
            window.location.href = 'signin.html';
            return;
        }
    }

    // Initialize sign in form
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', handleSignIn);
    }

    // Initialize sign up form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }

    setupPasswordToggle();
}); 
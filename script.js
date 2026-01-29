// ===== MAIN APPLICATION SCRIPT =====

// Global variables
let currentUser = null;

// DOM Elements
const elements = {
    // Navigation
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileMenu: document.getElementById('mobile-menu'),
    mobileMenuClose: document.getElementById('mobile-menu-close'),
    
    // Auth
    authContainer: document.getElementById('auth-container'),
    mobileAuthContainer: document.getElementById('mobile-auth-container'),
    
    // Language
    languageToggle: document.getElementById('language-toggle'),
    languageDropdown: document.getElementById('language-dropdown')
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Initialize Firebase authentication
    initFirebaseAuth();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup language selector
    setupLanguageSelector();
    
    // Setup smooth scrolling for anchor links
    setupSmoothScrolling();
    
    // Setup animations
    setupAnimations();
    
    // Update user stats
    updateUserStats();
}

// ===== FIREBASE AUTHENTICATION =====
function initFirebaseAuth() {
    authManager.addAuthListener(handleAuthStateChange);
}

function handleAuthStateChange(user) {
    currentUser = user;
    updateAuthUI(user);
}

function updateAuthUI(user) {
    const authHTML = user ? createAuthenticatedUI(user) : createUnauthenticatedUI();
    
    // Update both desktop and mobile auth containers
    if (elements.authContainer) {
        elements.authContainer.innerHTML = authHTML;
    }
    
    if (elements.mobileAuthContainer) {
        elements.mobileAuthContainer.innerHTML = authHTML;
    }
    
    // Add event listeners to new auth buttons
    if (user) {
        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', handleLogout);
        });
    } else {
        const googleBtns = document.querySelectorAll('.google-login');
        const githubBtns = document.querySelectorAll('.github-login');
        
        googleBtns.forEach(btn => {
            btn.addEventListener('click', () => handleLogin('google'));
        });
        
        githubBtns.forEach(btn => {
            btn.addEventListener('click', () => handleLogin('github'));
        });
    }
}

function createAuthenticatedUI(user) {
    const displayName = user.displayName || 'User';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    return `
        <div class="user-info">
            <div class="user-avatar">
                ${user.photoURL ? 
                    `<img src="${user.photoURL}" alt="${displayName}" style="width: 100%; height: 100%; border-radius: 50%;">` : 
                    initials
                }
            </div>
            <span class="user-name">${displayName.split(' ')[0]}</span>
        </div>
        <button class="btn btn-secondary logout-btn">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
}

function createUnauthenticatedUI() {
    return `
        <div class="auth-buttons">
            <button class="btn btn-secondary google-login">
                <i class="fab fa-google"></i>
            </button>
            <button class="btn btn-secondary github-login">
                <i class="fab fa-github"></i>
            </button>
        </div>
    `;
}

async function handleLogin(provider) {
    try {
        let result;
        if (provider === 'google') {
            result = await authManager.signInWithGoogle();
        } else if (provider === 'github') {
            result = await authManager.signInWithGitHub();
        }
        
        if (result.success) {
            showNotification('Successfully signed in!', 'success');
        } else {
            showNotification(`Login failed: ${result.error}`, 'error');
        }
    } catch (error) {
        showNotification(`Login error: ${error.message}`, 'error');
    }
}

async function handleLogout() {
    try {
        const result = await authManager.signOut();
        if (result.success) {
            showNotification('Successfully signed out!', 'success');
        } else {
            showNotification(`Logout failed: ${result.error}`, 'error');
        }
    } catch (error) {
        showNotification(`Logout error: ${error.message}`, 'error');
    }
}

// ===== MOBILE MENU =====
function setupMobileMenu() {
    if (!elements.mobileMenuBtn || !elements.mobileMenu || !elements.mobileMenuClose) {
        return;
    }
    
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.mobileMenu.classList.add('open');
    });
    
    elements.mobileMenuClose.addEventListener('click', () => {
        elements.mobileMenu.classList.remove('open');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (elements.mobileMenu.classList.contains('open') && 
            !elements.mobileMenu.contains(e.target) && 
            !elements.mobileMenuBtn.contains(e.target)) {
            elements.mobileMenu.classList.remove('open');
        }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.mobileMenu.classList.contains('open')) {
            elements.mobileMenu.classList.remove('open');
        }
    });
}

// ===== LANGUAGE SELECTOR =====
function setupLanguageSelector() {
    if (!elements.languageToggle || !elements.languageDropdown) {
        return;
    }
    
    elements.languageToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.languageDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        elements.languageDropdown.classList.remove('show');
    });
}

// ===== SMOOTH SCROLLING =====
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            // Skip if it's a language selector
            if (this.classList.contains('language-option') || 
                this.classList.contains('mobile-lang-option')) {
                return;
            }
            
            // Handle mobile menu links
            if (elements.mobileMenu && elements.mobileMenu.classList.contains('open')) {
                elements.mobileMenu.classList.remove('open');
            }
            
            // Get target element
            const targetElement = document.querySelector(href);
            if (!targetElement) return;
            
            e.preventDefault();
            
            // Scroll to target
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
}

// ===== ANIMATIONS =====
function setupAnimations() {
    // Add fade-in animation to elements on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all feature cards, steps, and other animatable elements
    document.querySelectorAll('.feature-card, .step, .cta-card').forEach(el => {
        observer.observe(el);
    });
}

// ===== STATISTICS =====
function updateUserStats() {
    // Simulate updating user stats
    // In production, this would come from Firebase
    setTimeout(() => {
        const stats = {
            users: Math.floor(Math.random() * 5000) + 10000,
            chats: Math.floor(Math.random() * 100000) + 500000,
            satisfaction: (Math.random() * 0.5 + 99.3).toFixed(1)
        };
        
        // Update CTA stats
        document.querySelectorAll('.cta-stat-number').forEach((el, index) => {
            if (index === 0) el.textContent = `${stats.users.toLocaleString()}+`;
            if (index === 1) el.textContent = `${stats.chats.toLocaleString()}+`;
            if (index === 2) el.textContent = `${stats.satisfaction}%`;
        });
    }, 1000);
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set icon based on type
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <div class="notification-content">
            <div class="notification-title">${languageManager.translate(`notification.${type}`)}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Create notifications container if it doesn't exist
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        document.body.appendChild(container);
    }
    
    // Add notification to container
    container.appendChild(notification);
    
    // Add close event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add slideOutRight animation
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for debugging
window.app = {
    languageManager,
    authManager,
    showNotification
};

console.log('Main application initialized');
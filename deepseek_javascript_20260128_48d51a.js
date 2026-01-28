// ===== GLOBAL VARIABLES =====
let currentCategory = 'programming';
let aiTools = {
    programming: [],
    image: []
};

// ===== DOM ELEMENTS =====
const elements = {
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileMenu: document.getElementById('mobile-menu'),
    mobileMenuClose: document.getElementById('mobile-menu-close'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
    
    // Auth
    authContainer: document.getElementById('auth-container'),
    mobileAuthContainer: document.getElementById('mobile-auth-container'),
    
    // Content
    categorySections: document.querySelectorAll('.category-section'),
    programmingTools: document.getElementById('programming-tools'),
    imageTools: document.getElementById('image-tools'),
    aiCount: document.getElementById('ai-count'),
    userCount: document.getElementById('user-count'),
    
    // Footer
    privacyLink: document.getElementById('privacy-link'),
    termsLink: document.getElementById('terms-link')
};

// ===== AI TOOLS DATA =====
const aiData = {
    programming: [
        {
            id: 'github-copilot',
            name: 'GitHub Copilot',
            description: 'Your AI pair programmer that suggests code and entire functions in real-time.',
            icon: 'fab fa-github',
            color: '#4078c0',
            features: ['Code completion', 'Function generation', 'Test writing', 'Bug detection'],
            tags: ['VSCode', 'JetBrains', 'AI Pair Programming'],
            website: 'https://github.com/features/copilot',
            category: 'programming',
            status: 'active'
        },
        {
            id: 'claude',
            name: 'Claude',
            description: 'Anthropic\'s AI assistant excelling at coding, analysis, and safe, helpful conversations.',
            icon: 'fas fa-brain',
            color: '#4a4a4a',
            features: ['Code generation', 'Debugging', 'Code review', 'Documentation'],
            tags: ['Anthropic', 'Code Analysis', 'API'],
            website: 'https://www.anthropic.com/claude',
            category: 'programming',
            status: 'active'
        },
        {
            id: 'deepseek',
            name: 'DeepSeek',
            description: 'Advanced coding assistant with deep understanding of multiple programming languages.',
            icon: 'fas fa-search',
            color: '#6366f1',
            features: ['Multi-language support', 'Code optimization', 'Algorithm explanation', 'Best practices'],
            tags: ['AI Assistant', 'Code Review', 'Learning'],
            website: 'https://www.deepseek.com',
            category: 'programming',
            status: 'active'
        },
        {
            id: 'gemini-programming',
            name: 'Gemini (Programming)',
            description: 'Google\'s AI specialized in coding tasks, from simple snippets to complex applications.',
            icon: 'fab fa-google',
            color: '#4285f4',
            features: ['Code generation', 'Error fixing', 'Code translation', 'Optimization'],
            tags: ['Google', 'Multi-language', 'Real-time'],
            website: 'https://gemini.google.com',
            category: 'programming',
            status: 'active'
        }
    ],
    image: [
        {
            id: 'gemini-image',
            name: 'Gemini Image',
            description: 'Generate stunning images from text descriptions with Google\'s advanced AI.',
            icon: 'fas fa-image',
            color: '#34a853',
            features: ['Text-to-image', 'Image editing', 'Style transfer', 'High resolution'],
            tags: ['Google', 'Image Generation', 'Creative'],
            website: 'https://gemini.google.com',
            category: 'image',
            status: 'active'
        },
        {
            id: 'nano-banana',
            name: 'Nano Banana',
            description: 'Lightweight yet powerful image generation AI with fast processing and creative outputs.',
            icon: 'fas fa-bolt',
            color: '#fbbc05',
            features: ['Fast generation', 'Multiple styles', 'Custom parameters', 'Batch processing'],
            tags: ['Lightweight', 'Fast', 'Creative'],
            website: '#',
            category: 'image',
            status: 'active'
        },
        {
            id: 'dall-e',
            name: 'DALL-E',
            description: 'Create realistic images and art from natural language descriptions.',
            icon: 'fas fa-palette',
            color: '#ea4335',
            features: ['Art generation', 'Photo-realistic', 'Style mixing', 'Inpainting'],
            tags: ['OpenAI', 'Creative', 'Advanced'],
            website: 'https://openai.com/dall-e',
            category: 'image',
            status: 'active'
        },
        {
            id: 'midjourney',
            name: 'Midjourney',
            description: 'Generate artistic and imaginative images with unique style and composition.',
            icon: 'fas fa-magic',
            color: '#1c1c1c',
            features: ['Artistic style', 'Community', 'Iterative refinement', 'High quality'],
            tags: ['Artistic', 'Community', 'Discord'],
            website: 'https://www.midjourney.com',
            category: 'image',
            status: 'active'
        }
    ]
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Initialize AI tools data
    aiTools = aiData;
    
    // Update statistics
    updateStats();
    
    // Render AI tool cards
    renderAITools();
    
    // Setup navigation
    setupNavigation();
    
    // Setup authentication
    setupAuthentication();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial category
    loadCategory(currentCategory);
    
    // Update user count with random number (simulated)
    updateUserCount();
}

// ===== STATISTICS FUNCTIONS =====
function updateStats() {
    const totalAIs = aiData.programming.length + aiData.image.length;
    elements.aiCount.textContent = totalAIs;
}

function updateUserCount() {
    // Simulate user count - in production, this would come from Firebase
    const userCount = Math.floor(Math.random() * 500) + 100;
    elements.userCount.textContent = `${userCount}+`;
}

// ===== RENDER FUNCTIONS =====
function renderAITools() {
    // Render programming tools
    renderToolCards(aiTools.programming, elements.programmingTools);
    
    // Render image tools
    renderToolCards(aiTools.image, elements.imageTools);
}

function renderToolCards(tools, container) {
    container.innerHTML = '';
    
    tools.forEach(tool => {
        const card = createToolCard(tool);
        container.appendChild(card);
    });
}

function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card fade-in';
    card.dataset.id = tool.id;
    
    // Create features HTML
    const featuresHTML = tool.features.map(feature => 
        `<span class="tool-tag">${feature}</span>`
    ).join('');
    
    // Create tags HTML
    const tagsHTML = tool.tags.map(tag => 
        `<span class="tool-tag">${tag}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="tool-header">
            <div class="tool-icon ${tool.category}" style="background: ${tool.color}">
                <i class="${tool.icon}"></i>
            </div>
            <div class="tool-title">
                <h3>${tool.name}</h3>
                <span class="tool-badge">${tool.status === 'active' ? '🟢 Active' : '🔴 Inactive'}</span>
            </div>
        </div>
        <div class="tool-content">
            <p class="tool-description">${tool.description}</p>
            <div class="tool-features">
                <h4>Key Features</h4>
                <div class="tool-tags">
                    ${featuresHTML}
                </div>
            </div>
        </div>
        <div class="tool-footer">
            <div class="tool-meta">
                <i class="fas fa-tags"></i>
                ${tagsHTML}
            </div>
            <button class="btn btn-primary open-chat-btn" data-type="${tool.category}">
                <i class="fas fa-comment"></i> Open Chat
            </button>
        </div>
    `;
    
    // Add click event to chat button
    const chatBtn = card.querySelector('.open-chat-btn');
    chatBtn.addEventListener('click', () => openChat(tool.category, tool.name));
    
    return card;
}

// ===== NAVIGATION FUNCTIONS =====
function setupNavigation() {
    // Desktop navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            loadCategory(category);
            
            // Update active state
            elements.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update mobile menu active state
            elements.mobileNavLinks.forEach(l => {
                if (l.dataset.category === category) {
                    l.classList.add('active');
                } else {
                    l.classList.remove('active');
                }
            });
        });
    });
    
    // Mobile navigation
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.mobileMenu.classList.add('open');
    });
    
    elements.mobileMenuClose.addEventListener('click', () => {
        elements.mobileMenu.classList.remove('open');
    });
    
    elements.mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            loadCategory(category);
            elements.mobileMenu.classList.remove('open');
            
            // Update active states
            elements.navLinks.forEach(l => {
                if (l.dataset.category === category) {
                    l.classList.add('active');
                } else {
                    l.classList.remove('active');
                }
            });
            
            elements.mobileNavLinks.forEach(l => {
                if (l.dataset.category === category) {
                    l.classList.add('active');
                } else {
                    l.classList.remove('active');
                }
            });
        });
    });
    
    // Handle hash changes
    window.addEventListener('hashchange', handleHashChange);
}

function handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (hash === 'programming' || hash === 'image') {
        loadCategory(hash);
        
        // Update active states
        elements.navLinks.forEach(link => {
            if (link.dataset.category === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        elements.mobileNavLinks.forEach(link => {
            if (link.dataset.category === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

function loadCategory(category) {
    currentCategory = category;
    
    // Update URL hash
    window.location.hash = category;
    
    // Show selected category, hide others
    elements.categorySections.forEach(section => {
        if (section.id === category) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

// ===== AUTHENTICATION FUNCTIONS =====
function setupAuthentication() {
    // Listen for auth state changes
    authManager.addAuthListener(updateAuthUI);
}

function updateAuthUI(user) {
    const authHTML = user ? createAuthenticatedUI(user) : createUnauthenticatedUI();
    elements.authContainer.innerHTML = authHTML;
    elements.mobileAuthContainer.innerHTML = authHTML;
    
    // Add event listeners to new auth buttons
    if (user) {
        const logoutBtn = elements.authContainer.querySelector('.logout-btn');
        const mobileLogoutBtn = elements.mobileAuthContainer.querySelector('.logout-btn');
        
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    } else {
        const googleBtn = elements.authContainer.querySelector('.google-login');
        const githubBtn = elements.authContainer.querySelector('.github-login');
        const mobileGoogleBtn = elements.mobileAuthContainer.querySelector('.google-login');
        const mobileGithubBtn = elements.mobileAuthContainer.querySelector('.github-login');
        
        if (googleBtn) googleBtn.addEventListener('click', () => handleLogin('google'));
        if (githubBtn) githubBtn.addEventListener('click', () => handleLogin('github'));
        if (mobileGoogleBtn) mobileGoogleBtn.addEventListener('click', () => handleLogin('google'));
        if (mobileGithubBtn) mobileGithubBtn.addEventListener('click', () => handleLogin('github'));
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
            <span class="user-name">${displayName}</span>
        </div>
        <button class="btn btn-secondary logout-btn">
            <i class="fas fa-sign-out-alt"></i> Logout
        </button>
    `;
}

function createUnauthenticatedUI() {
    return `
        <div class="auth-buttons">
            <button class="btn btn-secondary google-login" style="margin-right: 8px;">
                <i class="fab fa-google"></i> Google
            </button>
            <button class="btn btn-secondary github-login">
                <i class="fab fa-github"></i> GitHub
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

// ===== CHAT FUNCTIONS =====
function openChat(type, toolName = '') {
    const params = new URLSearchParams();
    params.append('type', type);
    if (toolName) {
        params.append('tool', encodeURIComponent(toolName));
    }
    
    // Navigate to chat page
    window.location.href = `chat.html?${params.toString()}`;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Privacy and Terms links
    if (elements.privacyLink) {
        elements.privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Privacy policy will be available soon!', 'info');
        });
    }
    
    if (elements.termsLink) {
        elements.termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Terms of service will be available soon!', 'info');
        });
    }
    
    // Handle Escape key for mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.mobileMenu.classList.contains('open')) {
            elements.mobileMenu.classList.remove('open');
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (elements.mobileMenu.classList.contains('open') && 
            !elements.mobileMenu.contains(e.target) && 
            !elements.mobileMenuBtn.contains(e.target)) {
            elements.mobileMenu.classList.remove('open');
        }
    });
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
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
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Add close button event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Add keyframe animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    document.body.appendChild(notification);
}

// ===== PAGE TRANSITIONS =====
function addPageTransition() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });
}

// Initialize page transition
addPageTransition();

// Export functions for debugging
window.app = {
    openChat,
    showNotification,
    authManager,
    aiTools
};

console.log('Main application initialized');
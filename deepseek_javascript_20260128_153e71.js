// ===== GLOBAL VARIABLES =====
let currentChatType = 'programming';
let currentChatId = null;
let currentTool = '';
let isHistoryOpen = false;

// ===== DOM ELEMENTS =====
const elements = {
    // Navigation
    chatContext: document.getElementById('chat-context'),
    chatAuthContainer: document.getElementById('chat-auth-container'),
    historyToggle: document.getElementById('history-toggle'),
    closeHistory: document.getElementById('close-history'),
    historySidebar: document.getElementById('history-sidebar'),
    
    // Chat UI
    chatTitle: document.getElementById('chat-title'),
    chatSubtitle: document.getElementById('chat-subtitle'),
    chatAiIcon: document.getElementById('chat-ai-icon'),
    chatMessages: document.getElementById('chat-messages'),
    welcomeContext: document.getElementById('welcome-context'),
    
    // Input Area
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    clearChat: document.getElementById('clear-chat'),
    saveChat: document.getElementById('save-chat'),
    attachBtn: document.getElementById('attach-btn'),
    promptBtn: document.getElementById('prompt-btn'),
    authNotice: document.getElementById('auth-notice'),
    charCount: document.getElementById('char-count'),
    
    // Quick Prompts
    quickPrompts: document.getElementById('quick-prompts'),
    
    // History
    historyList: document.getElementById('history-list'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    
    // Modals
    promptModal: document.getElementById('prompt-modal'),
    closePromptModal: document.getElementById('close-prompt-modal'),
    suggestedPrompts: document.querySelectorAll('.suggested-prompt')
};

// ===== CHAT CONFIGURATION =====
const chatConfig = {
    programming: {
        title: 'Programming Assistant',
        subtitle: 'Ask me about code, algorithms, debugging, and best practices',
        icon: 'fas fa-code',
        color: '#3b82f6',
        welcomeText: 'programming and software development',
        prompts: [
            'How do I implement a binary search algorithm?',
            'What are the best practices for React component structure?',
            'Explain async/await in JavaScript with examples',
            'How can I optimize database queries for better performance?'
        ]
    },
    image: {
        title: 'Image Generation Assistant',
        subtitle: 'Ask me about image generation, prompts, styles, and creative ideas',
        icon: 'fas fa-image',
        color: '#10b981',
        welcomeText: 'image generation and creative visual design',
        prompts: [
            'Generate an image prompt for a futuristic city at night',
            'What are the best parameters for realistic portrait generation?',
            'How can I create consistent character designs across multiple images?',
            'Describe a mystical forest scene with magical elements'
        ]
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initChat();
});

async function initChat() {
    // Parse URL parameters
    parseURLParameters();
    
    // Setup chat based on type
    setupChatUI();
    
    // Setup authentication
    setupChatAuthentication();
    
    // Setup event listeners
    setupChatEventListeners();
    
    // Load chat history if user is logged in
    loadChatHistory();
    
    // Focus on input
    elements.chatInput.focus();
    
    // Initialize auto-resize for textarea
    initAutoResize();
}

// ===== URL PARAMETER PARSING =====
function parseURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get chat type from URL
    const typeParam = urlParams.get('type');
    if (typeParam && (typeParam === 'programming' || typeParam === 'image')) {
        currentChatType = typeParam;
    }
    
    // Get tool name from URL if provided
    const toolParam = urlParams.get('tool');
    if (toolParam) {
        currentTool = decodeURIComponent(toolParam);
    }
}

// ===== CHAT UI SETUP =====
function setupChatUI() {
    const config = chatConfig[currentChatType];
    
    // Update page title
    document.title = `${config.title} - AI Tools Hub`;
    
    // Update chat context
    elements.chatContext.innerHTML = `
        <div class="context-icon ${currentChatType}">
            <i class="${config.icon}"></i>
        </div>
        <div class="context-text">
            <h3>${config.title}</h3>
            <p>${currentTool || 'General Assistant'}</p>
        </div>
    `;
    
    // Update chat header
    elements.chatTitle.textContent = config.title;
    elements.chatSubtitle.textContent = config.subtitle;
    
    // Update AI icon
    elements.chatAiIcon.innerHTML = `<i class="${config.icon}"></i>`;
    elements.chatAiIcon.style.background = `linear-gradient(135deg, ${config.color}, ${currentChatType === 'programming' ? '#8b5cf6' : '#3b82f6'})`;
    
    // Update welcome message
    elements.welcomeContext.textContent = config.welcomeText;
    
    // Update quick prompts
    updateQuickPrompts(config.prompts);
}

function updateQuickPrompts(prompts) {
    elements.quickPrompts.innerHTML = '';
    
    prompts.forEach((prompt, index) => {
        const button = document.createElement('button');
        button.className = 'quick-prompt';
        button.innerHTML = `
            <i class="${index < 2 ? 'fas fa-code' : 'fas fa-image'}"></i>
            ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}
        `;
        button.dataset.prompt = prompt;
        button.addEventListener('click', () => {
            elements.chatInput.value = prompt;
            elements.chatInput.focus();
            updateCharCount();
            autoResizeTextarea();
        });
        elements.quickPrompts.appendChild(button);
    });
}

// ===== AUTHENTICATION SETUP =====
function setupChatAuthentication() {
    // Listen for auth state changes
    authManager.addAuthListener(updateChatAuthUI);
}

function updateChatAuthUI(user) {
    const authHTML = user ? createChatAuthenticatedUI(user) : createChatUnauthenticatedUI();
    elements.chatAuthContainer.innerHTML = authHTML;
    
    // Update auth notice
    if (user) {
        elements.authNotice.classList.add('hidden');
        elements.saveChat.disabled = false;
    } else {
        elements.authNotice.classList.remove('hidden');
        elements.saveChat.disabled = true;
    }
    
    // Add event listeners to new auth buttons
    if (user) {
        const logoutBtn = elements.chatAuthContainer.querySelector('.logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleChatLogout);
    } else {
        const googleBtn = elements.chatAuthContainer.querySelector('.google-login');
        const githubBtn = elements.chatAuthContainer.querySelector('.github-login');
        
        if (googleBtn) googleBtn.addEventListener('click', () => handleChatLogin('google'));
        if (githubBtn) githubBtn.addEventListener('click', () => handleChatLogin('github'));
    }
    
    // Load chat history if user just logged in
    if (user) {
        loadChatHistory();
    } else {
        clearHistoryList();
    }
}

function createChatAuthenticatedUI(user) {
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
        <button class="btn btn-secondary logout-btn" style="margin-left: 8px;">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
}

function createChatUnauthenticatedUI() {
    return `
        <div class="auth-buttons">
            <button class="btn btn-secondary google-login" style="margin-right: 4px;">
                <i class="fab fa-google"></i>
            </button>
            <button class="btn btn-secondary github-login">
                <i class="fab fa-github"></i>
            </button>
        </div>
    `;
}

async function handleChatLogin(provider) {
    try {
        let result;
        if (provider === 'google') {
            result = await authManager.signInWithGoogle();
        } else if (provider === 'github') {
            result = await authManager.signInWithGitHub();
        }
        
        if (result.success) {
            showChatNotification('Successfully signed in! Chat history will be saved.', 'success');
        } else {
            showChatNotification(`Login failed: ${result.error}`, 'error');
        }
    } catch (error) {
        showChatNotification(`Login error: ${error.message}`, 'error');
    }
}

async function handleChatLogout() {
    try {
        const result = await authManager.signOut();
        if (result.success) {
            showChatNotification('Successfully signed out!', 'success');
            clearHistoryList();
        } else {
            showChatNotification(`Logout failed: ${result.error}`, 'error');
        }
    } catch (error) {
        showChatNotification(`Logout error: ${error.message}`, 'error');
    }
}

// ===== CHAT HISTORY FUNCTIONS =====
async function loadChatHistory(filter = 'all') {
    const user = authManager.getCurrentUser();
    if (!user) {
        clearHistoryList();
        return;
    }
    
    try {
        const result = await chatManager.loadChatHistory(user.uid, filter === 'all' ? 'all' : currentChatType);
        
        if (result.success) {
            renderChatHistory(result.chats, filter);
        } else {
            showChatNotification(`Failed to load history: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
        showChatNotification('Error loading chat history', 'error');
    }
}

function renderChatHistory(chats, filter = 'all') {
    clearHistoryList();
    
    if (chats.length === 0) {
        elements.historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-comment-slash"></i>
                <p>No chat history yet</p>
            </div>
        `;
        return;
    }
    
    // Filter chats if needed
    const filteredChats = filter === 'all' ? chats : chats.filter(chat => chat.type === filter);
    
    filteredChats.forEach(chat => {
        const historyItem = createHistoryItem(chat);
        elements.historyList.appendChild(historyItem);
    });
}

function createHistoryItem(chat) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.dataset.chatId = chat.id;
    
    const lastMessage = chat.messages && chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1]?.text || 'No messages'
        : 'No messages';
    
    const preview = firebaseUtils.truncateText(lastMessage, 60);
    const timeAgo = firebaseUtils.formatTimestamp(chat.updatedAt || chat.createdAt);
    const iconClass = firebaseUtils.getChatTypeIcon(chat.type);
    
    item.innerHTML = `
        <div class="history-item-header">
            <div class="history-item-title">
                <i class="${iconClass}"></i>
                ${chat.title || 'Untitled Chat'}
            </div>
            <span class="history-item-time">${timeAgo}</span>
        </div>
        <div class="history-item-preview">${preview}</div>
        <div class="history-item-footer">
            <span class="history-item-badge ${chat.type}">${chat.type}</span>
            <span class="history-item-count">${chat.messageCount || 0} messages</span>
        </div>
    `;
    
    // Add click event
    item.addEventListener('click', () => loadChatFromHistory(chat.id));
    
    return item;
}

function clearHistoryList() {
    elements.historyList.innerHTML = '';
}

async function loadChatFromHistory(chatId) {
    try {
        const result = await chatManager.loadChat(chatId);
        
        if (result.success) {
            currentChatId = chatId;
            displayChatMessages(result.chatData.messages);
            showChatNotification('Chat loaded successfully', 'success');
            
            // Update active state in history list
            document.querySelectorAll('.history-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.chatId === chatId) {
                    item.classList.add('active');
                }
            });
            
            // Close history sidebar on mobile
            if (window.innerWidth <= 1024) {
                toggleHistorySidebar();
            }
        } else {
            showChatNotification(`Failed to load chat: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error loading chat:', error);
        showChatNotification('Error loading chat', 'error');
    }
}

// ===== CHAT MESSAGE FUNCTIONS =====
async function sendMessage() {
    const messageText = elements.chatInput.value.trim();
    
    if (!messageText) {
        showChatNotification('Please enter a message', 'warning');
        return;
    }
    
    // Check message length
    if (messageText.length > 1000) {
        showChatNotification('Message too long (max 1000 characters)', 'error');
        return;
    }
    
    const user = authManager.getCurrentUser();
    const timestamp = new Date();
    
    // Create message object
    const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: messageText,
        sender: user ? 'user' : 'guest',
        timestamp: timestamp,
        userId: user ? user.uid : null,
        userName: user ? user.displayName : 'Guest'
    };
    
    // Add message to UI immediately
    addMessageToUI(message);
    
    // Clear input
    elements.chatInput.value = '';
    updateCharCount();
    autoResizeTextarea();
    
    // Save message to Firebase if user is authenticated
    if (user) {
        await saveMessageToFirebase(message);
    } else {
        // Show warning for guest users
        showChatNotification('Sign in to save your chat history', 'warning');
    }
    
    // Generate AI response (simulated for now)
    setTimeout(() => generateAIResponse(messageText), 1000);
}

async function saveMessageToFirebase(message) {
    const user = authManager.getCurrentUser();
    if (!user) return;
    
    try {
        // If no current chat, create one
        if (!currentChatId) {
            const result = await chatManager.createChat(user.uid, currentChatType, message);
            if (result.success) {
                currentChatId = result.chatId;
                
                // Update chat title with first message
                if (message.text.length > 10) {
                    const title = message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '');
                    await chatManager.updateChatTitle(currentChatId, title);
                }
            }
        } else {
            // Add message to existing chat
            await chatManager.addMessage(currentChatId, message);
        }
    } catch (error) {
        console.error('Error saving message:', error);
        showChatNotification('Failed to save message to cloud', 'error');
    }
}

function generateAIResponse(userMessage) {
    const timestamp = new Date();
    const config = chatConfig[currentChatType];
    
    // Simulate AI thinking
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        
        // Generate response based on chat type
        let responseText = '';
        
        if (currentChatType === 'programming') {
            responseText = generateProgrammingResponse(userMessage);
        } else {
            responseText = generateImageResponse(userMessage);
        }
        
        // Create AI message
        const aiMessage = {
            id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: responseText,
            sender: 'ai',
            timestamp: timestamp,
            aiName: config.title
        };
        
        // Add AI message to UI
        addMessageToUI(aiMessage);
        
        // Save AI response if user is authenticated
        const user = authManager.getCurrentUser();
        if (user && currentChatId) {
            chatManager.addMessage(currentChatId, aiMessage);
        }
    }, 1500);
}

function generateProgrammingResponse(userMessage) {
    const responses = [
        `I understand you're asking about programming. Here's what I can suggest:\n\n` +
        `Based on your query "${userMessage.substring(0, 50)}...", here are some best practices:\n` +
        `1. Always write clean, readable code with proper comments\n` +
        `2. Use version control (Git) for all your projects\n` +
        `3. Write tests for critical functionality\n` +
        `4. Follow the DRY (Don't Repeat Yourself) principle\n` +
        `5. Use meaningful variable and function names\n\n` +
        `Would you like me to provide a specific code example or explain any concept in more detail?`,
        
        `That's an interesting programming question! For "${userMessage.substring(0, 30)}...", consider:\n\n` +
        `• Using established design patterns where appropriate\n` +
        `• Implementing proper error handling\n` +
        `• Considering performance implications\n` +
        `• Writing documentation for complex logic\n` +
        `• Keeping functions small and focused on single responsibilities\n\n` +
        `I can help you with code examples, debugging tips, or architecture advice.`,
        
        `Great question about programming! Here's my advice:\n\n` +
        `Modern development often involves:\n` +
        `- Using frameworks and libraries effectively\n` +
        `- Understanding asynchronous programming\n` +
        `- Implementing security best practices\n` +
        `- Writing maintainable and scalable code\n` +
        `- Continuous learning and staying updated\n\n` +
        `What specific technology or language would you like to focus on?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function generateImageResponse(userMessage) {
    const responses = [
        `I can help you with image generation! For "${userMessage.substring(0, 50)}...", here are some tips:\n\n` +
        `**Prompt Engineering:**\n` +
        `• Be specific about subject, style, and composition\n` +
        `• Include details about lighting, colors, and mood\n` +
        `• Specify artistic style if desired (photorealistic, painting, digital art, etc.)\n` +
        `• Mention important elements and their relationships\n\n` +
        `**Technical Parameters:**\n` +
        `• Resolution and aspect ratio\n` +
        `• Style strength and guidance scale\n` +
        `• Number of iterations\n` +
        `• Seed for reproducibility\n\n` +
        `Would you like me to help craft a detailed prompt?`,
        
        `Interesting image generation request! For "${userMessage.substring(0, 30)}...":\n\n` +
        `**Creative Tips:**\n` +
        `• Combine unexpected elements for unique results\n` +
        `• Use descriptive adjectives for mood and atmosphere\n` +
        `• Reference specific artists or art movements\n` +
        `• Consider perspective and camera angles\n` +
        `• Add details about textures and materials\n\n` +
        `**Common Styles:**\n` +
        `• Photorealistic\n` +
        `• Digital painting\n` +
        `• Watercolor\n` +
        `• Anime/Manga\n` +
        `• Cyberpunk\n` +
        `• Fantasy art\n\n` +
        `What style are you interested in?`,
        
        `Let's create some amazing images! Based on your query, here's what you should consider:\n\n` +
        `**For Best Results:**\n` +
        `1. Start with a clear main subject\n` +
        `2. Add environmental context\n` +
        `3. Specify time of day and lighting\n` +
        `4. Include emotional tone\n` +
        `5. Mention color palette preferences\n` +
        `6. Add quality indicators (4K, detailed, sharp focus)\n\n` +
        `**Example Prompt Structure:**\n` +
        `"A [subject] in/on [setting], [action/pose], [lighting], [style], [colors], [quality descriptors]"\n\n` +
        `Want me to help refine your prompt?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function addMessageToUI(message) {
    const messageElement = createMessageElement(message);
    elements.chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender}`;
    messageDiv.dataset.messageId = message.id;
    
    const timeString = firebaseUtils.formatTimestamp(message.timestamp);
    const senderName = message.sender === 'user' 
        ? (message.userName || 'You')
        : (message.aiName || 'AI Assistant');
    
    const avatarIcon = message.sender === 'user' 
        ? '<i class="fas fa-user"></i>'
        : '<i class="fas fa-robot"></i>';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatarIcon}
        </div>
        <div class="message-content">
            <div class="message-sender">${senderName}</div>
            <div class="message-text">${formatMessageText(message.text)}</div>
            <div class="message-time">${timeString}</div>
        </div>
    `;
    
    return messageDiv;
}

function formatMessageText(text) {
    // Convert markdown-like syntax to HTML
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/\•/g, '•')
        .replace(/(\d+\.)\s/g, '<br>$1 ');
    
    // Ensure proper paragraph formatting
    formatted = formatted.replace(/<br><br>/g, '</p><p>');
    
    return `<p>${formatted}</p>`;
}

function displayChatMessages(messages) {
    // Clear existing messages except welcome message
    const existingMessages = Array.from(elements.chatMessages.children);
    existingMessages.forEach(child => {
        if (!child.classList.contains('welcome-message')) {
            child.remove();
        }
    });
    
    // Add messages
    if (messages && messages.length > 0) {
        messages.forEach(message => {
            addMessageToUI(message);
        });
    }
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-sender">AI Assistant</div>
            <div class="message-text">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for typing dots
    const style = document.createElement('style');
    style.textContent = `
        .typing-dots {
            display: flex;
            gap: 4px;
            padding: 8px 0;
        }
        .typing-dots span {
            width: 8px;
            height: 8px;
            background-color: var(--text-secondary);
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
        }
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    elements.chatMessages.appendChild(typingDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ===== CHAT MANAGEMENT FUNCTIONS =====
async function clearCurrentChat() {
    if (!elements.chatMessages) return;
    
    // Keep only the welcome message
    const messages = Array.from(elements.chatMessages.children);
    messages.forEach(child => {
        if (!child.classList.contains('welcome-message')) {
            child.remove();
        }
    });
    
    // Clear current chat ID
    currentChatId = null;
    
    // Clear from Firebase if authenticated
    const user = authManager.getCurrentUser();
    if (user && currentChatId) {
        await chatManager.clearChatMessages(currentChatId);
    }
    
    showChatNotification('Chat cleared', 'success');
}

async function saveCurrentChat() {
    const user = authManager.getCurrentUser();
    if (!user) {
        showChatNotification('Please sign in to save chats', 'warning');
        return;
    }
    
    if (!currentChatId) {
        showChatNotification('No active chat to save', 'warning');
        return;
    }
    
    showChatNotification('Chat saved successfully', 'success');
}

// ===== EVENT LISTENERS =====
function setupChatEventListeners() {
    // Send message on button click
    elements.sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter (but allow Shift+Enter for new line)
    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Character count
    elements.chatInput.addEventListener('input', updateCharCount);
    
    // Clear chat
    elements.clearChat.addEventListener('click', clearCurrentChat);
    
    // Save chat
    elements.saveChat.addEventListener('click', saveCurrentChat);
    
    // Toggle history sidebar
    elements.historyToggle.addEventListener('click', toggleHistorySidebar);
    elements.closeHistory.addEventListener('click', toggleHistorySidebar);
    
    // Filter buttons
    elements.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            // Update active state
            elements.filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Load filtered history
            loadChatHistory(filter);
        });
    });
    
    // Prompt suggestions
    elements.promptBtn.addEventListener('click', () => {
        elements.promptModal.classList.add('show');
    });
    
    elements.closePromptModal.addEventListener('click', () => {
        elements.promptModal.classList.remove('show');
    });
    
    // Close modal when clicking outside
    elements.promptModal.addEventListener('click', (e) => {
        if (e.target === elements.promptModal) {
            elements.promptModal.classList.remove('show');
        }
    });
    
    // Suggested prompts
    elements.suggestedPrompts.forEach(prompt => {
        prompt.addEventListener('click', () => {
            elements.chatInput.value = prompt.dataset.prompt;
            elements.chatInput.focus();
            updateCharCount();
            autoResizeTextarea();
            elements.promptModal.classList.remove('show');
        });
    });
    
    // Attach button (placeholder)
    elements.attachBtn.addEventListener('click', () => {
        showChatNotification('File attachment feature coming soon!', 'info');
    });
    
    // Quick prompts
    document.addEventListener('click', (e) => {
        if (e.target.closest('.quick-prompt')) {
            const prompt = e.target.closest('.quick-prompt').dataset.prompt;
            elements.chatInput.value = prompt;
            elements.chatInput.focus();
            updateCharCount();
            autoResizeTextarea();
        }
    });
    
    // Close history sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (isHistoryOpen && window.innerWidth <= 1024) {
            if (!elements.historySidebar.contains(e.target) && 
                !elements.historyToggle.contains(e.target)) {
                toggleHistorySidebar();
            }
        }
    });
    
    // Handle Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.promptModal.classList.contains('show')) {
                elements.promptModal.classList.remove('show');
            }
            
            if (isHistoryOpen && window.innerWidth <= 1024) {
                toggleHistorySidebar();
            }
        }
    });
}

function toggleHistorySidebar() {
    isHistoryOpen = !isHistoryOpen;
    elements.historySidebar.classList.toggle('open', isHistoryOpen);
}

function initAutoResize() {
    elements.chatInput.addEventListener('input', autoResizeTextarea);
}

function autoResizeTextarea() {
    const textarea = elements.chatInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function updateCharCount() {
    const length = elements.chatInput.value.length;
    elements.charCount.textContent = length;
    
    // Update color based on length
    elements.charCount.className = 'char-count';
    if (length > 800) {
        elements.charCount.classList.add('warning');
    }
    if (length > 950) {
        elements.charCount.classList.add('error');
    }
}

// ===== NOTIFICATION FUNCTIONS =====
function showChatNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.chat-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `chat-notification chat-notification-${type}`;
    
    // Set icon based on type
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    if (type === 'info') icon = 'fas fa-info-circle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: chatNotificationSlideIn 0.3s ease;
        font-size: 14px;
        max-width: 90%;
        text-align: center;
    `;
    
    // Add keyframe animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes chatNotificationSlideIn {
            from { transform: translateX(-50%) translateY(20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes chatNotificationSlideOut {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(20px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'chatNotificationSlideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
    
    document.body.appendChild(notification);
}

// ===== INITIAL FOCUS AND READY STATE =====
window.addEventListener('load', () => {
    // Focus on input
    elements.chatInput.focus();
    
    // Show welcome message
    console.log('Chat application ready');
    
    // Update char count
    updateCharCount();
});

// Export for debugging
window.chatApp = {
    sendMessage,
    clearCurrentChat,
    saveCurrentChat,
    loadChatHistory,
    currentChatType,
    currentChatId,
    authManager,
    chatManager
};
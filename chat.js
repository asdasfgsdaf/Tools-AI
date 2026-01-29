// ===== CHAT APPLICATION =====

// Global variables
let currentChatId = null;
let selectedModel = 'auto';
let isTyping = false;
let chatHistory = [];
let currentFilter = 'all';

// DOM Elements
const elements = {
    // Navigation
    historyToggle: document.getElementById('history-toggle'),
    settingsToggle: document.getElementById('settings-toggle'),
    sidebarClose: document.getElementById('sidebar-close'),
    settingsClose: document.getElementById('settings-close'),
    chatSidebar: document.getElementById('chat-sidebar'),
    settingsSidebar: document.getElementById('settings-sidebar'),
    
    // Chat UI
    welcomeScreen: document.getElementById('welcome-screen'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    
    // Model Selector
    currentModel: document.getElementById('current-model'),
    modelSelectorToggle: document.getElementById('model-selector-toggle'),
    modelSelectorDropdown: document.getElementById('model-selector-dropdown'),
    
    // Quick Actions
    quickActions: document.querySelectorAll('.quick-action'),
    exampleButtons: document.querySelectorAll('.example-btn'),
    
    // Tools
    clearChat: document.getElementById('clear-chat'),
    exportChat: document.getElementById('export-chat'),
    attachFile: document.getElementById('attach-file'),
    
    // History
    historyList: document.getElementById('history-list'),
    emptyHistory: document.getElementById('empty-history'),
    historySearch: document.getElementById('history-search'),
    historyFilters: document.querySelectorAll('.sidebar-filter'),
    clearHistory: document.getElementById('clear-history'),
    
    // Settings
    defaultModel: document.getElementById('default-model'),
    interfaceLanguage: document.getElementById('interface-language'),
    saveSettings: document.getElementById('save-settings'),
    resetSettings: document.getElementById('reset-settings'),
    
    // Auth
    chatAuthContainer: document.getElementById('chat-auth-container'),
    authInfo: document.getElementById('auth-info'),
    
    // Status
    modelStatusBar: document.getElementById('model-status-bar')
};

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    initChat();
});

async function initChat() {
    // Initialize Firebase authentication
    initChatAuth();
    
    // Setup chat event listeners
    setupChatEvents();
    
    // Setup model selector
    setupModelSelector();
    
    // Setup settings
    setupSettings();
    
    // Setup history
    setupHistory();
    
    // Setup language manager
    setupChatLanguage();
    
    // Load user preferences
    loadUserPreferences();
    
    // Focus on input
    elements.chatInput.focus();
    
    // Setup auto-resize for textarea
    setupAutoResize();
    
    console.log('Chat application initialized');
}

// ===== AUTHENTICATION =====
function initChatAuth() {
    authManager.addAuthListener(handleChatAuthStateChange);
}

function handleChatAuthStateChange(user) {
    updateChatAuthUI(user);
    
    if (user) {
        // Load user's chat history
        loadChatHistory();
        
        // Update auth info
        if (elements.authInfo) {
            elements.authInfo.innerHTML = `
                <i class="fas fa-user-check"></i>
                <span>${user.displayName || 'User'}</span>
            `;
        }
    } else {
        // Show guest mode
        if (elements.authInfo) {
            elements.authInfo.innerHTML = `
                <i class="fas fa-user"></i>
                <span>${languageManager.translate('chat.input.guest')}</span>
            `;
        }
        
        // Clear history list
        if (elements.historyList) {
            elements.historyList.innerHTML = '';
        }
    }
}

function updateChatAuthUI(user) {
    const authHTML = user ? createChatAuthenticatedUI(user) : createChatUnauthenticatedUI();
    
    if (elements.chatAuthContainer) {
        elements.chatAuthContainer.innerHTML = authHTML;
    }
    
    // Add event listeners
    if (user) {
        const logoutBtn = elements.chatAuthContainer.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleChatLogout);
        }
    } else {
        const googleBtn = elements.chatAuthContainer.querySelector('.google-login');
        const githubBtn = elements.chatAuthContainer.querySelector('.github-login');
        
        if (googleBtn) {
            googleBtn.addEventListener('click', () => handleChatLogin('google'));
        }
        
        if (githubBtn) {
            githubBtn.addEventListener('click', () => handleChatLogin('github'));
        }
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
        </div>
        <button class="btn btn-secondary logout-btn">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
}

function createChatUnauthenticatedUI() {
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

async function handleChatLogin(provider) {
    try {
        let result;
        if (provider === 'google') {
            result = await authManager.signInWithGoogle();
        } else if (provider === 'github') {
            result = await authManager.signInWithGitHub();
        }
        
        if (result.success) {
            showChatNotification(languageManager.translate('notification.success') + ': Successfully signed in!', 'success');
        } else {
            showChatNotification(languageManager.translate('notification.error') + `: ${result.error}`, 'error');
        }
    } catch (error) {
        showChatNotification(languageManager.translate('notification.error') + `: ${error.message}`, 'error');
    }
}

async function handleChatLogout() {
    try {
        const result = await authManager.signOut();
        if (result.success) {
            showChatNotification(languageManager.translate('notification.success') + ': Successfully signed out!', 'success');
        } else {
            showChatNotification(languageManager.translate('notification.error') + `: ${result.error}`, 'error');
        }
    } catch (error) {
        showChatNotification(languageManager.translate('notification.error') + `: ${error.message}`, 'error');
    }
}

// ===== CHAT EVENTS =====
function setupChatEvents() {
    // Send message on button click
    if (elements.sendBtn) {
        elements.sendBtn.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter (but allow Shift+Enter for new line)
    if (elements.chatInput) {
        elements.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Character count
        elements.chatInput.addEventListener('input', updateCharCount);
    }
    
    // Clear chat
    if (elements.clearChat) {
        elements.clearChat.addEventListener('click', clearCurrentChat);
    }
    
    // Export chat
    if (elements.exportChat) {
        elements.exportChat.addEventListener('click', exportChat);
    }
    
    // Attach file
    if (elements.attachFile) {
        elements.attachFile.addEventListener('click', () => {
            showChatNotification('File attachment feature coming soon!', 'info');
        });
    }
    
    // Toggle sidebars
    if (elements.historyToggle) {
        elements.historyToggle.addEventListener('click', toggleHistorySidebar);
    }
    
    if (elements.settingsToggle) {
        elements.settingsToggle.addEventListener('click', toggleSettingsSidebar);
    }
    
    if (elements.sidebarClose) {
        elements.sidebarClose.addEventListener('click', toggleHistorySidebar);
    }
    
    if (elements.settingsClose) {
        elements.settingsClose.addEventListener('click', toggleSettingsSidebar);
    }
    
    // Close sidebars when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (elements.chatSidebar && elements.chatSidebar.classList.contains('open')) {
                if (!elements.chatSidebar.contains(e.target) && 
                    !elements.historyToggle.contains(e.target)) {
                    toggleHistorySidebar();
                }
            }
            
            if (elements.settingsSidebar && elements.settingsSidebar.classList.contains('open')) {
                if (!elements.settingsSidebar.contains(e.target) && 
                    !elements.settingsToggle.contains(e.target)) {
                    toggleSettingsSidebar();
                }
            }
        }
    });
    
    // Handle Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.chatSidebar && elements.chatSidebar.classList.contains('open')) {
                toggleHistorySidebar();
            }
            
            if (elements.settingsSidebar && elements.settingsSidebar.classList.contains('open')) {
                toggleSettingsSidebar();
            }
            
            if (elements.modelSelectorDropdown && elements.modelSelectorDropdown.classList.contains('show')) {
                toggleModelSelector();
            }
        }
    });
    
    // Quick actions
    if (elements.quickActions) {
        elements.quickActions.forEach(action => {
            action.addEventListener('click', () => {
                const actionType = action.dataset.action;
                handleQuickAction(actionType);
            });
        });
    }
    
    // Example buttons
    if (elements.exampleButtons) {
        elements.exampleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const exampleType = button.dataset.example;
                handleExample(exampleType);
                
                // Hide welcome screen
                if (elements.welcomeScreen) {
                    elements.welcomeScreen.style.display = 'none';
                }
            });
        });
    }
}

function toggleHistorySidebar() {
    if (elements.chatSidebar) {
        elements.chatSidebar.classList.toggle('open');
        
        // Close settings sidebar if open
        if (elements.settingsSidebar && elements.settingsSidebar.classList.contains('open')) {
            elements.settingsSidebar.classList.remove('open');
        }
    }
}

function toggleSettingsSidebar() {
    if (elements.settingsSidebar) {
        elements.settingsSidebar.classList.toggle('open');
        
        // Close history sidebar if open
        if (elements.chatSidebar && elements.chatSidebar.classList.contains('open')) {
            elements.chatSidebar.classList.remove('open');
        }
    }
}

// ===== MODEL SELECTOR =====
function setupModelSelector() {
    if (!elements.modelSelectorToggle || !elements.modelSelectorDropdown) {
        return;
    }
    
    elements.modelSelectorToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModelSelector();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (elements.modelSelectorDropdown.classList.contains('show')) {
            toggleModelSelector();
        }
    });
    
    // Handle model selection
    elements.modelSelectorDropdown.querySelectorAll('.model-option').forEach(option => {
        option.addEventListener('click', () => {
            const model = option.dataset.model;
            selectModel(model);
            toggleModelSelector();
        });
    });
}

function toggleModelSelector() {
    elements.modelSelectorDropdown.classList.toggle('show');
}

function selectModel(model) {
    selectedModel = model;
    
    // Update current model display
    if (elements.currentModel) {
        const modelNames = {
            'auto': languageManager.translate('model.auto'),
            'claude': languageManager.translate('model.claude'),
            'deepseek': languageManager.translate('model.deepseek'),
            'copilot': languageManager.translate('model.copilot'),
            'gemini': languageManager.translate('model.gemini'),
            'nanobanana': languageManager.translate('model.nanobanana')
        };
        
        elements.currentModel.textContent = modelNames[model] || model;
    }
    
    // Update model indicators
    document.querySelectorAll('.model-indicator').forEach(indicator => {
        if (indicator.dataset.model === model) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
    
    // Save preference
    localStorage.setItem('neuralink_selected_model', model);
    
    showChatNotification(`Switched to ${modelNames[model] || model}`, 'info');
}

// ===== CHAT MESSAGES =====
async function sendMessage() {
    const messageText = elements.chatInput.value.trim();
    
    if (!messageText) {
        showChatNotification('Please enter a message', 'warning');
        return;
    }
    
    // Check message length
    if (messageText.length > 2000) {
        showChatNotification('Message too long (max 2000 characters)', 'error');
        return;
    }
    
    // Hide welcome screen if visible
    if (elements.welcomeScreen && elements.welcomeScreen.style.display !== 'none') {
        elements.welcomeScreen.style.display = 'none';
    }
    
    const user = authManager.getCurrentUser();
    const timestamp = new Date();
    
    // Create message object
    const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: messageText,
        sender: 'user',
        timestamp: timestamp,
        userId: user ? user.uid : null,
        userName: user ? user.displayName : 'Guest',
        model: selectedModel
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
    
    // Generate AI response
    generateAIResponse(messageText);
}

function addMessageToUI(message) {
    const messageElement = createMessageElement(message);
    
    if (elements.chatMessages) {
        elements.chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender}`;
    messageDiv.dataset.messageId = message.id;
    
    const timeString = formatTime(message.timestamp);
    const senderName = message.sender === 'user' 
        ? (message.userName || 'You')
        : (message.aiName || 'NeuraLink AI');
    
    const avatarIcon = message.sender === 'user' 
        ? '<i class="fas fa-user"></i>'
        : '<i class="fas fa-robot"></i>';
    
    let modelBadge = '';
    if (message.model && message.model !== 'auto') {
        const modelNames = {
            'claude': languageManager.translate('model.claude'),
            'deepseek': languageManager.translate('model.deepseek'),
            'copilot': languageManager.translate('model.copilot'),
            'gemini': languageManager.translate('model.gemini'),
            'nanobanana': languageManager.translate('model.nanobanana')
        };
        
        modelBadge = `
            <div class="message-model-indicator">
                <i class="fas fa-microchip"></i>
                <span>${modelNames[message.model] || message.model}</span>
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatarIcon}
        </div>
        <div class="message-content">
            <div class="message-header">
                <div class="message-sender">${senderName}</div>
                <div class="message-time">${timeString}</div>
            </div>
            <div class="message-text">${formatMessageText(message.text)}</div>
            <div class="message-footer">
                <div class="message-actions">
                    <button class="message-action" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="message-action" title="Like">
                        <i class="far fa-thumbs-up"></i>
                    </button>
                    <button class="message-action" title="Dislike">
                        <i class="far fa-thumbs-down"></i>
                    </button>
                </div>
                ${modelBadge}
            </div>
        </div>
    `;
    
    // Add event listeners to message actions
    const copyBtn = messageDiv.querySelector('.message-action:nth-child(1)');
    const likeBtn = messageDiv.querySelector('.message-action:nth-child(2)');
    const dislikeBtn = messageDiv.querySelector('.message-action:nth-child(3)');
    
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(message.text);
            showChatNotification('Message copied to clipboard', 'success');
        });
    }
    
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
            likeBtn.style.color = 'var(--success)';
        });
    }
    
    if (dislikeBtn) {
        dislikeBtn.addEventListener('click', () => {
            dislikeBtn.innerHTML = '<i class="fas fa-thumbs-down"></i>';
            dislikeBtn.style.color = 'var(--danger)';
        });
    }
    
    return messageDiv;
}

function formatMessageText(text) {
    // Convert markdown-like syntax to HTML
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    
    // Handle code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code)}</code></pre>`;
    });
    
    return formatted;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===== AI RESPONSE GENERATION =====
function generateAIResponse(userMessage) {
    if (isTyping) return;
    
    const timestamp = new Date();
    const model = selectedModel === 'auto' ? determineBestModel(userMessage) : selectedModel;
    
    // Show typing indicator
    showTypingIndicator(model);
    isTyping = true;
    
    // Simulate AI thinking
    setTimeout(() => {
        removeTypingIndicator();
        isTyping = false;
        
        // Generate response based on model
        let responseText = generateResponseForModel(userMessage, model);
        
        // Create AI message
        const aiMessage = {
            id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: responseText,
            sender: 'ai',
            timestamp: timestamp,
            aiName: 'NeuraLink AI',
            model: model
        };
        
        // Add AI message to UI
        addMessageToUI(aiMessage);
        
        // Save AI response if user is authenticated
        const user = authManager.getCurrentUser();
        if (user && currentChatId) {
            chatManager.addMessage(currentChatId, aiMessage);
        }
    }, getResponseDelay(model));
}

function determineBestModel(message) {
    const messageLower = message.toLowerCase();
    
    // Check for image-related keywords
    const imageKeywords = ['image', 'picture', 'photo', 'generate', 'create', 'draw', 'visual', 'art', 'design', 'logo', 'illustration'];
    if (imageKeywords.some(keyword => messageLower.includes(keyword))) {
        // For artistic/creative requests, use NanoBanana
        if (messageLower.includes('artistic') || messageLower.includes('creative') || 
            messageLower.includes('painting') || messageLower.includes('drawing')) {
            return 'nanobanana';
        }
        // For realistic images, use Gemini
        return 'gemini';
    }
    
    // Check for code-related keywords
    const codeKeywords = ['code', 'program', 'function', 'algorithm', 'bug', 'debug', 'error', 'syntax', 'compile', 'variable', 'class'];
    if (codeKeywords.some(keyword => messageLower.includes(keyword))) {
        // For complex reasoning or explanations, use Claude
        if (messageLower.includes('explain') || messageLower.includes('why') || 
            messageLower.includes('how') || messageLower.includes('complex')) {
            return 'claude';
        }
        // For code generation or completion, use Copilot
        if (messageLower.includes('generate') || messageLower.includes('write') || 
            messageLower.includes('create') || messageLower.includes('complete')) {
            return 'copilot';
        }
        // For optimization or analysis, use DeepSeek
        if (messageLower.includes('optimize') || messageLower.includes('improve') || 
            messageLower.includes('analyze') || messageLower.includes('review')) {
            return 'deepseek';
        }
        // Default to Claude for code questions
        return 'claude';
    }
    
    // Default to Claude for general questions
    return 'claude';
}

function generateResponseForModel(userMessage, model) {
    const responses = {
        claude: [
            `I've analyzed your query about "${userMessage.substring(0, 50)}..." and here's my detailed response:\n\n` +
            `As Claude, I specialize in reasoning and complex problem-solving. For this type of question, ` +
            `I recommend considering multiple approaches and evaluating the trade-offs between them.\n\n` +
            `**Key Insights:**\n` +
            `• Consider the broader context and implications\n` +
            `• Evaluate alternative solutions\n` +
            `• Think about edge cases and potential issues\n` +
            `• Consider long-term maintainability\n\n` +
            `Would you like me to elaborate on any specific aspect or provide more detailed examples?`,
            
            `That's an excellent question! Based on my analysis as Claude:\n\n` +
            `**Primary Considerations:**\n` +
            `1. Understanding the fundamental principles involved\n` +
            `2. Identifying the core problem to solve\n` +
            `3. Considering scalability and performance implications\n` +
            `4. Evaluating different implementation strategies\n\n` +
            `**Recommended Approach:**\n` +
            `I suggest starting with a clear understanding of the requirements, then exploring ` +
            `multiple solution paths before selecting the most appropriate one.\n\n` +
            `What specific aspect would you like to focus on first?`
        ],
        
        deepseek: [
            `Analyzing your code-related query about "${userMessage.substring(0, 50)}...":\n\n` +
            `**Code Analysis Results:**\n` +
            `✅ Syntax appears correct\n` +
            `🔍 Found potential optimization opportunities\n` +
            `💡 Suggestions for improvement:\n\n` +
            `1. **Performance Optimization:** Consider using more efficient data structures\n` +
            `2. **Readability:** Add comments for complex logic sections\n` +
            `3. **Error Handling:** Implement comprehensive error checking\n` +
            `4. **Testing:** Consider edge cases in your test coverage\n\n` +
            `**Optimized Approach:**\n` +
            `Here's how you could improve the implementation for better performance and maintainability...`,
            
            `DeepSeek analysis complete for your programming question!\n\n` +
            `**Technical Assessment:**\n` +
            `• Complexity: Medium\n` +
            `• Optimization Potential: High\n` +
            `• Best Practices Alignment: Good\n\n` +
            `**Specific Recommendations:**\n` +
            `1. Refactor duplicate code into reusable functions\n` +
            `2. Implement caching for expensive operations\n` +
            `3. Use appropriate design patterns for scalability\n` +
            `4. Consider memory usage and garbage collection\n\n` +
            `Would you like me to provide code examples for any of these optimizations?`
        ],
        
        copilot: [
            `Here's the code you requested for "${userMessage.substring(0, 50)}...":\n\n` +
            `\`\`\`javascript\n` +
            `// ${userMessage.substring(0, 40)}\n` +
            `function solution() {\n` +
            `  // Implementation based on your requirements\n` +
            `  const result = processRequest();\n` +
            `  \n` +
            `  // Error handling and validation\n` +
            `  if (!result) {\n` +
            `    throw new Error('Processing failed');\n` +
            `  }\n` +
            `  \n` +
            `  return result;\n` +
            `}\n` +
            `\n` +
            `// Helper functions\n` +
            `function processRequest() {\n` +
            `  // Core logic here\n` +
            `  return { success: true, data: 'processed' };\n` +
            `}\n` +
            `\`\`\`\n\n` +
            `**Explanation:**\n` +
            `This implementation follows best practices with proper error handling and modular design. ` +
            `You can customize the helper functions based on your specific requirements.`,
            
            `Based on your request, here's a complete implementation:\n\n` +
            `\`\`\`python\n` +
            `#!/usr/bin/env python3\n` +
            `# ${userMessage.substring(0, 40)}\n` +
            `\n` +
            `import sys\n` +
            `from typing import Any, Dict, List\n` +
            `\n` +
            `class Solution:\n` +
            `    def __init__(self):\n` +
            `        self.data: Dict[str, Any] = {}\n` +
            `    \n` +
            `    def process(self, input_data: str) -> str:\n` +
            `        \"\"\"Process the input and return result.\"\"\"\n` +
            `        # Your logic here\n` +
            `        processed = input_data.upper()\n` +
            `        return processed\n` +
            `\n` +
            `if __name__ == "__main__":\n` +
            `    solution = Solution()\n` +
            `    result = solution.process("test")\n` +
            `    print(f"Result: {result}")\n` +
            `\`\`\`\n\n` +
            `This code includes type hints, proper documentation, and follows Python best practices.`
        ],
        
        gemini: [
            `I'll generate an image based on your description: "${userMessage.substring(0, 50)}..."\n\n` +
            `**Image Generation Details:**\n` +
            `• Style: Photorealistic\n` +
            `• Resolution: 4K\n` +
            `• Aspect Ratio: 16:9\n` +
            `• Lighting: Professional studio lighting\n` +
            `• Composition: Rule of thirds, balanced elements\n\n` +
            `**Prompt Enhancement:**\n` +
            `To get the best results from Gemini, I recommend using this enhanced prompt:\n\n` +
            `"Professional photography of [your subject], detailed texture, sharp focus, cinematic lighting, ` +
            `high resolution, 8K, ultra-realistic, photorealistic, studio quality, masterpiece"\n\n` +
            `Would you like me to generate this image or refine the prompt further?`,
            
            `Creating image based on: "${userMessage.substring(0, 50)}..."\n\n` +
            `**Gemini Image Generation Settings:**\n` +
            `📸 **Photography Style:**\n` +
            `- Camera: Professional DSLR\n` +
            `- Lens: 50mm prime\n` +
            `- Aperture: f/2.8\n` +
            `- ISO: 100\n` +
            `- Shutter Speed: 1/125s\n\n` +
            `🎨 **Visual Elements:**\n` +
            `- Color palette: Harmonious and balanced\n` +
            `- Contrast: Moderate for natural look\n` +
            `- Saturation: True-to-life colors\n` +
            `- Sharpness: High detail\n\n` +
            `**Result Preview:**\n` +
            `The generated image will feature professional composition with excellent depth of field.`
        ],
        
        nanobanana: [
            `🎨 Generating creative image for: "${userMessage.substring(0, 50)}..."\n\n` +
            `**Artistic Style:**\n` +
            `✨ **NanoBanana Special:**\n` +
            `- Style: Digital painting with artistic flair\n` +
            `- Mood: Creative and expressive\n` +
            `- Color Scheme: Vibrant and imaginative\n` +
            `- Textures: Painterly brush strokes\n` +
            `- Composition: Dynamic and engaging\n\n` +
            `**Artistic Interpretation:**\n` +
            `I'll interpret your request with creative freedom, adding artistic elements that enhance ` +
            `the visual appeal while maintaining the core concept.\n\n` +
            `**Sample Prompt Style:**\n` +
            `"Whimsical digital painting of [your subject], vibrant colors, expressive brushwork, ` +
            `fantasy elements, magical atmosphere, detailed, trending on ArtStation, masterpiece"\n\n` +
            `Ready to create something amazing?`,
            
            `🌟 NanoBanana creative mode activated for: "${userMessage.substring(0, 50)}..."\n\n` +
            `**Creative Features:**\n` +
            `🎭 **Artistic Interpretation:**\n` +
            `- Style: Mixed media with digital elements\n` +
            `- Inspiration: Fantasy and surrealism\n` +
            `- Color Palette: Bold and unconventional\n` +
            `- Texture: Layered and complex\n\n` +
            `✨ **Magic Elements:**\n` +
            `- Glowing effects\n` +
            `- Ethereal lighting\n` +
            `- Mystical atmosphere\n` +
            `- Dreamlike quality\n\n` +
            `**Result Expectation:**\n` +
            `You'll receive a unique artistic interpretation that goes beyond literal representation, ` +
            `adding creative elements that make the image truly special.`
        ]
    };
    
    const modelResponses = responses[model] || responses.claude;
    return modelResponses[Math.floor(Math.random() * modelResponses.length)];
}

function getResponseDelay(model) {
    const delays = {
        'claude': 2000,
        'deepseek': 1500,
        'copilot': 1000,
        'gemini': 2500,
        'nanobanana': 1800
    };
    return delays[model] || 1500;
}

function showTypingIndicator(model) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    const modelNames = {
        'claude': languageManager.translate('model.claude'),
        'deepseek': languageManager.translate('model.deepseek'),
        'copilot': languageManager.translate('model.copilot'),
        'gemini': languageManager.translate('model.gemini'),
        'nanobanana': languageManager.translate('model.nanobanana')
    };
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-header">
                <div class="message-sender">${modelNames[model] || 'AI'} is typing...</div>
            </div>
            <div class="message-text">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    if (elements.chatMessages) {
        elements.chatMessages.appendChild(typingDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ===== QUICK ACTIONS =====
function handleQuickAction(actionType) {
    const prompts = {
        code: "Write a Python function to calculate Fibonacci sequence",
        image: "Generate an image of a cyberpunk city at night",
        debug: "Help me debug this JavaScript error: 'undefined is not a function'",
        explain: "Explain how machine learning algorithms work",
        translate: "Translate 'Hello, how are you?' to Spanish"
    };
    
    if (prompts[actionType]) {
        elements.chatInput.value = prompts[actionType];
        elements.chatInput.focus();
        updateCharCount();
        autoResizeTextarea();
        
        // Hide welcome screen
        if (elements.welcomeScreen) {
            elements.welcomeScreen.style.display = 'none';
        }
    }
}

function handleExample(exampleType) {
    const examples = {
        code: "Create a React login component with validation and error handling",
        image: "Generate a futuristic dashboard interface for a data analytics platform",
        explain: "Explain async/await in JavaScript with practical examples",
        debug: "Debug this Python function that's returning incorrect results"
    };
    
    if (examples[exampleType]) {
        elements.chatInput.value = examples[exampleType];
        elements.chatInput.focus();
        updateCharCount();
        autoResizeTextarea();
    }
}

// ===== CHAT MANAGEMENT =====
function clearCurrentChat() {
    if (!confirm('Are you sure you want to clear the current chat?')) {
        return;
    }
    
    // Clear messages from UI
    if (elements.chatMessages) {
        elements.chatMessages.innerHTML = '';
    }
    
    // Reset current chat
    currentChatId = null;
    
    // Show welcome screen
    if (elements.welcomeScreen) {
        elements.welcomeScreen.style.display = 'flex';
    }
    
    // Clear from Firebase if authenticated
    const user = authManager.getCurrentUser();
    if (user && currentChatId) {
        chatManager.clearChatMessages(currentChatId);
    }
    
    showChatNotification('Chat cleared', 'success');
}

function exportChat() {
    const messages = [];
    document.querySelectorAll('.message').forEach(msg => {
        const sender = msg.querySelector('.message-sender')?.textContent || 'Unknown';
        const text = msg.querySelector('.message-text')?.textContent || '';
        const time = msg.querySelector('.message-time')?.textContent || '';
        
        messages.push(`[${time}] ${sender}: ${text}`);
    });
    
    const chatText = messages.join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuralink-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showChatNotification('Chat exported successfully', 'success');
}

// ===== HISTORY MANAGEMENT =====
function setupHistory() {
    // History search
    if (elements.historySearch) {
        elements.historySearch.addEventListener('input', debounce(searchHistory, 300));
    }
    
    // History filters
    if (elements.historyFilters) {
        elements.historyFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                const filterType = filter.dataset.filter;
                setHistoryFilter(filterType);
            });
        });
    }
    
    // Clear history
    if (elements.clearHistory) {
        elements.clearHistory.addEventListener('click', clearAllHistory);
    }
}

async function loadChatHistory() {
    const user = authManager.getCurrentUser();
    if (!user) {
        showEmptyHistory();
        return;
    }
    
    try {
        const result = await chatManager.loadChatHistory(user.uid, currentFilter === 'all' ? 'all' : currentFilter);
        
        if (result.success) {
            chatHistory = result.chats;
            renderHistoryList(result.chats);
        } else {
            showChatNotification(`Failed to load history: ${result.error}`, 'error');
            showEmptyHistory();
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
        showEmptyHistory();
    }
}

function renderHistoryList(chats) {
    if (!elements.historyList || !elements.emptyHistory) {
        return;
    }
    
    if (chats.length === 0) {
        showEmptyHistory();
        return;
    }
    
    elements.emptyHistory.style.display = 'none';
    elements.historyList.innerHTML = '';
    
    chats.forEach(chat => {
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
    
    const preview = truncateText(lastMessage, 60);
    const timeAgo = formatTime(chat.updatedAt || chat.createdAt);
    const messageCount = chat.messageCount || 0;
    
    // Determine icon based on chat type
    let icon = 'fas fa-comment';
    if (chat.type === 'programming') icon = 'fas fa-code';
    if (chat.type === 'image') icon = 'fas fa-image';
    
    item.innerHTML = `
        <div class="history-item-header">
            <div class="history-item-title">
                <i class="${icon}"></i>
                ${chat.title || 'Untitled Chat'}
            </div>
            <span class="history-item-time">${timeAgo}</span>
        </div>
        <div class="history-item-preview">${preview}</div>
        <div class="history-item-footer">
            <span class="history-item-badge">${chat.type || 'general'}</span>
            <span class="history-item-count">${messageCount} messages</span>
        </div>
    `;
    
    // Add click event
    item.addEventListener('click', () => loadChatFromHistory(chat.id));
    
    return item;
}

function showEmptyHistory() {
    if (!elements.historyList || !elements.emptyHistory) {
        return;
    }
    
    elements.historyList.innerHTML = '';
    elements.emptyHistory.style.display = 'block';
}

function searchHistory() {
    const searchTerm = elements.historySearch.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderHistoryList(chatHistory);
        return;
    }
    
    const filteredChats = chatHistory.filter(chat => {
        const title = (chat.title || '').toLowerCase();
        const preview = chat.messages && chat.messages.length > 0 
            ? (chat.messages[chat.messages.length - 1]?.text || '').toLowerCase()
            : '';
        
        return title.includes(searchTerm) || preview.includes(searchTerm);
    });
    
    renderHistoryList(filteredChats);
}

function setHistoryFilter(filterType) {
    currentFilter = filterType;
    
    // Update active state
    elements.historyFilters.forEach(filter => {
        if (filter.dataset.filter === filterType) {
            filter.classList.add('active');
        } else {
            filter.classList.remove('active');
        }
    });
    
    // Reload history with filter
    loadChatHistory();
}

async function clearAllHistory() {
    if (!confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
        return;
    }
    
    const user = authManager.getCurrentUser();
    if (!user) {
        showChatNotification('You need to be signed in to clear history', 'warning');
        return;
    }
    
    // In a real app, you would delete from Firebase
    // For now, we'll just clear the UI
    chatHistory = [];
    showEmptyHistory();
    
    showChatNotification('Chat history cleared', 'success');
}

// ===== SETTINGS =====
function setupSettings() {
    // Load saved settings
    loadSettings();
    
    // Save settings
    if (elements.saveSettings) {
        elements.saveSettings.addEventListener('click', saveSettings);
    }
    
    // Reset settings
    if (elements.resetSettings) {
        elements.resetSettings.addEventListener('click', resetSettings);
    }
}

function loadSettings() {
    // Load selected model
    const savedModel = localStorage.getItem('neuralink_selected_model');
    if (savedModel && elements.defaultModel) {
        elements.defaultModel.value = savedModel;
        selectModel(savedModel);
    }
    
    // Load interface language
    const savedLang = localStorage.getItem('neuralink_language');
    if (savedLang && elements.interfaceLanguage) {
        elements.interfaceLanguage.value = savedLang;
    }
    
    // Load other settings
    const saveHistory = localStorage.getItem('neuralink_save_history');
    if (saveHistory !== null && document.getElementById('save-history')) {
        document.getElementById('save-history').checked = saveHistory === 'true';
    }
    
    const improvementData = localStorage.getItem('neuralink_improvement_data');
    if (improvementData !== null && document.getElementById('improvement-data')) {
        document.getElementById('improvement-data').checked = improvementData === 'true';
    }
    
    const responseSpeed = localStorage.getItem('neuralink_response_speed');
    if (responseSpeed && document.querySelector(`.speed-option[data-speed="${responseSpeed}"]`)) {
        document.querySelectorAll('.speed-option').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.speed-option[data-speed="${responseSpeed}"]`).classList.add('active');
    }
    
    const theme = localStorage.getItem('neuralink_theme');
    if (theme && document.querySelector(`.theme-option[data-theme="${theme}"]`)) {
        document.querySelectorAll('.theme-option').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.theme-option[data-theme="${theme}"]`).classList.add('active');
    }
}

function saveSettings() {
    // Save model preference
    if (elements.defaultModel) {
        localStorage.setItem('neuralink_selected_model', elements.defaultModel.value);
        selectModel(elements.defaultModel.value);
    }
    
    // Save interface language
    if (elements.interfaceLanguage) {
        const lang = elements.interfaceLanguage.value;
        localStorage.setItem('neuralink_language', lang);
        languageManager.setLanguage(lang);
    }
    
    // Save other settings
    const saveHistory = document.getElementById('save-history');
    if (saveHistory) {
        localStorage.setItem('neuralink_save_history', saveHistory.checked);
    }
    
    const improvementData = document.getElementById('improvement-data');
    if (improvementData) {
        localStorage.setItem('neuralink_improvement_data', improvementData.checked);
    }
    
    const activeSpeed = document.querySelector('.speed-option.active');
    if (activeSpeed) {
        localStorage.setItem('neuralink_response_speed', activeSpeed.dataset.speed);
    }
    
    const activeTheme = document.querySelector('.theme-option.active');
    if (activeTheme) {
        localStorage.setItem('neuralink_theme', activeTheme.dataset.theme);
    }
    
    showChatNotification('Settings saved successfully', 'success');
    toggleSettingsSidebar();
}

function resetSettings() {
    if (!confirm('Reset all settings to default values?')) {
        return;
    }
    
    // Clear all settings
    localStorage.removeItem('neuralink_selected_model');
    localStorage.removeItem('neuralink_save_history');
    localStorage.removeItem('neuralink_improvement_data');
    localStorage.removeItem('neuralink_response_speed');
    localStorage.removeItem('neuralink_theme');
    
    // Reload settings
    loadSettings();
    
    showChatNotification('Settings reset to defaults', 'success');
}

// ===== LANGUAGE =====
function setupChatLanguage() {
    // Listen for language changes
    languageManager.addLanguageChangeCallback(updateChatLanguage);
    
    // Update chat interface immediately
    updateChatLanguage(languageManager.getCurrentLanguage());
}

function updateChatLanguage(lang) {
    // Update chat input placeholder
    if (elements.chatInput) {
        elements.chatInput.placeholder = languageManager.translate('chat.input.placeholder');
    }
    
    // Update send button
    if (elements.sendBtn) {
        const sendText = elements.sendBtn.querySelector('span');
        if (sendText) {
            sendText.textContent = languageManager.translate('chat.input.send');
        }
    }
    
    // Update quick actions
    document.querySelectorAll('.quick-action span').forEach((span, index) => {
        const actions = ['code', 'image', 'debug', 'explain', 'translate'];
        if (actions[index]) {
            span.textContent = languageManager.translate(`chat.input.${actions[index]}`);
        }
    });
    
    // Update tooltips and other text
    // This would be expanded in a production app
}

// ===== UTILITY FUNCTIONS =====
function setupAutoResize() {
    if (!elements.chatInput) return;
    
    elements.chatInput.addEventListener('input', autoResizeTextarea);
    autoResizeTextarea();
}

function autoResizeTextarea() {
    if (!elements.chatInput) return;
    
    elements.chatInput.style.height = 'auto';
    elements.chatInput.style.height = Math.min(elements.chatInput.scrollHeight, 200) + 'px';
}

function updateCharCount() {
    if (!elements.chatInput) return;
    
    const length = elements.chatInput.value.length;
    const charCount = document.getElementById('char-count');
    
    if (charCount) {
        charCount.textContent = length;
        
        // Update color based on length
        charCount.className = 'char-count';
        if (length > 1500) {
            charCount.classList.add('warning');
        }
        if (length > 1800) {
            charCount.classList.add('error');
        }
    }
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

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

function showChatNotification(message, type = 'info') {
    // Create notification
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

function loadUserPreferences() {
    // Load selected model
    const savedModel = localStorage.getItem('neuralink_selected_model');
    if (savedModel) {
        selectModel(savedModel);
    }
}

// ===== FIREBASE INTEGRATION =====
async function saveMessageToFirebase(message) {
    const user = authManager.getCurrentUser();
    if (!user) return;
    
    try {
        // If no current chat, create one
        if (!currentChatId) {
            const chatType = determineChatType(message.text);
            const result = await chatManager.createChat(user.uid, chatType, message);
            
            if (result.success) {
                currentChatId = result.chatId;
                
                // Update chat title with first message
                if (message.text.length > 10) {
                    const title = message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '');
                    await chatManager.updateChatTitle(currentChatId, title);
                }
                
                // Add to history list
                loadChatHistory();
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

function determineChatType(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('image') || messageLower.includes('picture') || 
        messageLower.includes('photo') || messageLower.includes('generate') || 
        messageLower.includes('create') || messageLower.includes('draw')) {
        return 'image';
    }
    
    if (messageLower.includes('code') || messageLower.includes('program') || 
        messageLower.includes('function') || messageLower.includes('algorithm') || 
        messageLower.includes('bug') || messageLower.includes('debug')) {
        return 'programming';
    }
    
    return 'general';
}

async function loadChatFromHistory(chatId) {
    try {
        const result = await chatManager.loadChat(chatId);
        
        if (result.success) {
            currentChatId = chatId;
            
            // Clear current chat messages
            if (elements.chatMessages) {
                elements.chatMessages.innerHTML = '';
            }
            
            // Hide welcome screen
            if (elements.welcomeScreen) {
                elements.welcomeScreen.style.display = 'none';
            }
            
            // Display chat messages
            if (result.chatData.messages && result.chatData.messages.length > 0) {
                result.chatData.messages.forEach(message => {
                    addMessageToUI(message);
                });
            }
            
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
            
            showChatNotification('Chat loaded successfully', 'success');
        } else {
            showChatNotification(`Failed to load chat: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error loading chat:', error);
        showChatNotification('Error loading chat', 'error');
    }
}

// Export for debugging
window.chatApp = {
    sendMessage,
    clearCurrentChat,
    selectModel,
    loadChatHistory,
    languageManager,
    authManager,
    chatManager
};
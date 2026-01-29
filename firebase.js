// ===== FIREBASE CONFIGURATION =====
// IMPORTANT: Replace with your own Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// ===== FIREBASE INITIALIZATION =====
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        console.error("Firestore persistence failed:", err);
    });

// ===== AUTHENTICATION MANAGER =====
class AuthManager {
    constructor() {
        this.user = null;
        this.authListeners = [];
        this.init();
    }

    init() {
        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            this.user = user;
            this.notifyListeners();
            
            // Initialize user data if user just signed in
            if (user) {
                this.initUserData(user.uid, user.displayName, user.email, user.photoURL);
            }
        });
    }

    // Add auth state listener
    addAuthListener(callback) {
        this.authListeners.push(callback);
        // Immediately call with current state
        callback(this.user);
    }

    // Notify all listeners
    notifyListeners() {
        this.authListeners.forEach(callback => callback(this.user));
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            const result = await auth.signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with GitHub
    async signInWithGitHub() {
        try {
            const provider = new firebase.auth.GithubAuthProvider();
            provider.addScope('user');
            
            const result = await auth.signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('GitHub sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Initialize user data in Firestore
    async initUserData(userId, displayName, email, photoURL) {
        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                // Create new user document
                await userRef.set({
                    displayName: displayName || 'User',
                    email: email || '',
                    photoURL: photoURL || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    preferences: {
                        language: 'en',
                        theme: 'dark',
                        defaultModel: 'auto'
                    },
                    stats: {
                        totalChats: 0,
                        totalMessages: 0,
                        programmingChats: 0,
                        imageChats: 0,
                        generalChats: 0
                    }
                });
                
                console.log('New user created in Firestore');
            } else {
                // Update last login
                await userRef.update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error initializing user data:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.user;
    }

    // Get user data from Firestore
    async getUserData(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                return { success: true, data: userDoc.data() };
            }
            return { success: false, error: 'User not found' };
        } catch (error) {
            console.error('Error getting user data:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user preferences
    async updateUserPreferences(userId, preferences) {
        try {
            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                'preferences': preferences,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user preferences:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user stats
    async updateUserStats(userId, statsUpdate) {
        try {
            const userRef = db.collection('users').doc(userId);
            
            // Prepare update object
            const updateObj = {};
            Object.keys(statsUpdate).forEach(key => {
                updateObj[`stats.${key}`] = firebase.firestore.FieldValue.increment(statsUpdate[key]);
            });
            updateObj.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await userRef.update(updateObj);
            return { success: true };
        } catch (error) {
            console.error('Error updating user stats:', error);
            return { success: false, error: error.message };
        }
    }
}

// ===== CHAT MANAGER =====
class ChatManager {
    constructor() {
        this.currentChatId = null;
        this.chatListeners = [];
        this.historyListeners = [];
    }

    // Create a new chat session
    async createChat(userId, chatType, initialMessage = null) {
        try {
            // Determine chat title from first message
            let chatTitle = `${chatType.charAt(0).toUpperCase() + chatType.slice(1)} Chat`;
            if (initialMessage && initialMessage.text) {
                const shortText = initialMessage.text.substring(0, 30);
                chatTitle = shortText + (initialMessage.text.length > 30 ? '...' : '');
            }

            const chatData = {
                userId: userId,
                type: chatType,
                title: chatTitle,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                messages: initialMessage ? [initialMessage] : [],
                messageCount: initialMessage ? 1 : 0,
                lastMessage: initialMessage ? initialMessage.text.substring(0, 100) : '',
                modelUsed: initialMessage?.model || 'auto'
            };

            const chatRef = await db.collection('chats').add(chatData);
            this.currentChatId = chatRef.id;

            // Update user stats
            const authManager = new AuthManager();
            await authManager.updateUserStats(userId, {
                totalChats: 1,
                [`${chatType}Chats`]: 1
            });

            return { 
                success: true, 
                chatId: chatRef.id,
                chatData: { ...chatData, id: chatRef.id }
            };
        } catch (error) {
            console.error('Error creating chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Load user's chat history
    async loadChatHistory(userId, chatType = 'all') {
        try {
            let query = db.collection('chats')
                .where('userId', '==', userId)
                .orderBy('updatedAt', 'desc')
                .limit(50);

            if (chatType !== 'all') {
                query = query.where('type', '==', chatType);
            }

            const snapshot = await query.get();
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamp to Date
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            }));

            return { success: true, chats };
        } catch (error) {
            console.error('Error loading chat history:', error);
            return { success: false, error: error.message };
        }
    }

    // Load a specific chat
    async loadChat(chatId) {
        try {
            const chatDoc = await db.collection('chats').doc(chatId).get();
            
            if (!chatDoc.exists) {
                return { success: false, error: 'Chat not found' };
            }

            const chatData = {
                id: chatDoc.id,
                ...chatDoc.data(),
                createdAt: chatDoc.data().createdAt?.toDate(),
                updatedAt: chatDoc.data().updatedAt?.toDate()
            };

            this.currentChatId = chatId;
            return { success: true, chatData };
        } catch (error) {
            console.error('Error loading chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Add a message to current chat
    async addMessage(chatId, message) {
        try {
            const chatRef = db.collection('chats').doc(chatId);
            const chatDoc = await chatRef.get();
            
            if (!chatDoc.exists) {
                return { success: false, error: 'Chat not found' };
            }

            // Add message to array
            await chatRef.update({
                messages: firebase.firestore.FieldValue.arrayUnion(message),
                messageCount: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: message.text.substring(0, 100),
                modelUsed: message.model || 'auto'
            });

            // Update user stats
            const authManager = new AuthManager();
            const user = authManager.getCurrentUser();
            if (user) {
                await authManager.updateUserStats(user.uid, {
                    totalMessages: 1
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error adding message:', error);
            return { success: false, error: error.message };
        }
    }

    // Update chat title
    async updateChatTitle(chatId, title) {
        try {
            await db.collection('chats').doc(chatId).update({
                title: title,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating chat title:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a chat
    async deleteChat(chatId, userId) {
        try {
            const chatDoc = await db.collection('chats').doc(chatId).get();
            
            if (!chatDoc.exists) {
                return { success: false, error: 'Chat not found' };
            }

            const chatData = chatDoc.data();
            
            // Delete the chat
            await db.collection('chats').doc(chatId).delete();
            
            // Update user stats
            const authManager = new AuthManager();
            await authManager.updateUserStats(userId, {
                totalChats: -1,
                [`${chatData.type}Chats`]: -1
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Clear all messages in chat
    async clearChatMessages(chatId) {
        try {
            await db.collection('chats').doc(chatId).update({
                messages: [],
                messageCount: 0,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: ''
            });
            return { success: true };
        } catch (error) {
            console.error('Error clearing chat messages:', error);
            return { success: false, error: error.message };
        }
    }

    // Get real-time updates for a chat
    subscribeToChat(chatId, callback) {
        const unsubscribe = db.collection('chats')
            .doc(chatId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const chatData = {
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toDate(),
                        updatedAt: doc.data().updatedAt?.toDate()
                    };
                    callback(chatData);
                }
            }, (error) => {
                console.error('Chat subscription error:', error);
            });

        this.chatListeners.push(unsubscribe);
        return unsubscribe;
    }

    // Get real-time updates for chat history
    subscribeToChatHistory(userId, chatType = 'all', callback) {
        let query = db.collection('chats')
            .where('userId', '==', userId)
            .orderBy('updatedAt', 'desc')
            .limit(20);

        if (chatType !== 'all') {
            query = query.where('type', '==', chatType);
        }

        const unsubscribe = query.onSnapshot((snapshot) => {
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            }));
            callback(chats);
        }, (error) => {
            console.error('Chat history subscription error:', error);
        });

        this.historyListeners.push(unsubscribe);
        return unsubscribe;
    }

    // Clean up all listeners
    cleanup() {
        this.chatListeners.forEach(unsubscribe => unsubscribe());
        this.historyListeners.forEach(unsubscribe => unsubscribe());
        this.chatListeners = [];
        this.historyListeners = [];
    }

    // Get current chat ID
    getCurrentChatId() {
        return this.currentChatId;
    }

    // Set current chat ID
    setCurrentChatId(chatId) {
        this.currentChatId = chatId;
    }
}

// ===== UTILITY FUNCTIONS =====
class FirebaseUtils {
    // Generate a unique ID
    static generateId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Format timestamp for display
    static formatTimestamp(timestamp) {
        if (!timestamp) return 'Just now';
        
        const date = timestamp.toDate ? timestamp.toDate() : timestamp;
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: diffDays < 365 ? undefined : 'numeric'
        });
    }

    // Truncate text with ellipsis
    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Get chat type icon
    static getChatTypeIcon(chatType) {
        const icons = {
            programming: 'fas fa-code',
            image: 'fas fa-image',
            general: 'fas fa-comment'
        };
        return icons[chatType] || 'fas fa-comment';
    }

    // Get chat type color
    static getChatTypeColor(chatType) {
        const colors = {
            programming: '#3b82f6',
            image: '#10b981',
            general: '#6366f1'
        };
        return colors[chatType] || '#6366f1';
    }

    // Get model icon
    static getModelIcon(model) {
        const icons = {
            claude: 'fas fa-brain',
            deepseek: 'fas fa-search',
            copilot: 'fab fa-github',
            gemini: 'fab fa-google',
            nanobanana: 'fas fa-bolt',
            auto: 'fas fa-magic'
        };
        return icons[model] || 'fas fa-robot';
    }
}

// ===== EXPORT MANAGERS =====
const authManager = new AuthManager();
const chatManager = new ChatManager();
const firebaseUtils = FirebaseUtils;

// Make available globally for debugging
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.authManager = authManager;
window.chatManager = chatManager;
window.firebaseUtils = firebaseUtils;

console.log('Firebase initialized successfully');
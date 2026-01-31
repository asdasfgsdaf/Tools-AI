// ===== VARIÁVEIS GLOBAIS =====
let currentChatId = null;
let chats = [];
let selectedModel = 'auto';

// ===== ELEMENTOS DOM =====
const elements = {
    sidebar: document.querySelector('.sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    menuBtn: document.getElementById('menu-btn'),
    mobileOverlay: document.getElementById('mobile-overlay'),
    newChatBtn: document.getElementById('new-chat'),
    chatHistory: document.getElementById('chat-history'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    modelSelect: document.getElementById('model-select'),
    currentModelInfo: document.getElementById('current-model-info'),
    charCount: document.getElementById('char-count')
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Carregar chats do LocalStorage
    loadChats();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Atualizar contador de caracteres
    updateCharCount();
    
    // Configurar auto-resize do textarea
    setupAutoResize();
    
    // Focar no input
    elements.chatInput.focus();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Toggle sidebar
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
    elements.menuBtn.addEventListener('click', toggleMobileSidebar);
    elements.mobileOverlay.addEventListener('click', closeMobileSidebar);
    
    // Novo chat
    elements.newChatBtn.addEventListener('click', createNewChat);
    
    // Enviar mensagem
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Atualizar contador de caracteres
    elements.chatInput.addEventListener('input', updateCharCount);
    
    // Selecionar modelo
    elements.modelSelect.addEventListener('change', updateSelectedModel);
    
    // Botões de prompt rápido
    document.querySelectorAll('.prompt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prompt = e.currentTarget.dataset.prompt;
            elements.chatInput.value = prompt;
            elements.chatInput.focus();
            updateCharCount();
            autoResizeTextarea();
            
            // Esconder mensagem de boas-vindas
            document.querySelector('.welcome-message').classList.add('hidden');
        });
    });
}

function toggleSidebar() {
    elements.sidebar.classList.toggle('collapsed');
    
    const icon = elements.sidebarToggle.querySelector('i');
    if (elements.sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
    }
}

function toggleMobileSidebar() {
    elements.sidebar.classList.toggle('show');
    elements.mobileOverlay.classList.toggle('show');
}

function closeMobileSidebar() {
    elements.sidebar.classList.remove('show');
    elements.mobileOverlay.classList.remove('show');
}

// ===== GERENCIAMENTO DE CHATS =====
function loadChats() {
    const savedChats = localStorage.getItem('neuralink_chats');
    if (savedChats) {
        chats = JSON.parse(savedChats);
        renderChatHistory();
    }
}

function saveChats() {
    localStorage.setItem('neuralink_chats', JSON.stringify(chats));
}

function createNewChat() {
    // Criar novo ID único
    currentChatId = 'chat_' + Date.now();
    
    // Criar objeto do chat
    const newChat = {
        id: currentChatId,
        title: 'Novo chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        model: selectedModel
    };
    
    // Adicionar à lista
    chats.unshift(newChat);
    
    // Salvar no LocalStorage
    saveChats();
    
    // Renderizar histórico
    renderChatHistory();
    
    // Limpar área de mensagens
    clearChatMessages();
    
    // Mostrar mensagem de boas-vindas
    document.querySelector('.welcome-message').classList.remove('hidden');
    
    // Fechar sidebar no mobile
    closeMobileSidebar();
    
    // Focar no input
    elements.chatInput.focus();
}

function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    
    // Atualizar modelo selecionado
    selectedModel = chat.model || 'auto';
    elements.modelSelect.value = selectedModel;
    updateSelectedModel();
    
    // Limpar mensagens atuais
    clearChatMessages();
    
    // Carregar mensagens do chat
    if (chat.messages.length === 0) {
        // Mostrar mensagem de boas-vindas se não houver mensagens
        document.querySelector('.welcome-message').classList.remove('hidden');
    } else {
        // Esconder mensagem de boas-vindas
        document.querySelector('.welcome-message').classList.add('hidden');
        
        // Renderizar mensagens
        chat.messages.forEach(message => {
            addMessageToUI(message, false);
        });
    }
    
    // Atualizar histórico
    renderChatHistory();
    
    // Fechar sidebar no mobile
    closeMobileSidebar();
    
    // Focar no input
    elements.chatInput.focus();
}

function deleteChat(chatId) {
    if (!confirm('Tem certeza que deseja excluir este chat?')) return;
    
    // Remover da lista
    chats = chats.filter(c => c.id !== chatId);
    
    // Salvar no LocalStorage
    saveChats();
    
    // Se era o chat atual, criar novo
    if (currentChatId === chatId) {
        createNewChat();
    } else {
        renderChatHistory();
    }
}

function renderChatHistory() {
    const chatHistory = elements.chatHistory;
    
    if (chats.length === 0) {
        chatHistory.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-comments"></i>
                <p>Nenhum histórico ainda</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por data (mais recente primeiro)
    const sortedChats = [...chats].sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    let html = '';
    
    sortedChats.forEach(chat => {
        const isActive = chat.id === currentChatId;
        const lastMessage = chat.messages[chat.messages.length - 1];
        const preview = lastMessage ? 
            (lastMessage.text.length > 40 ? lastMessage.text.substring(0, 40) + '...' : lastMessage.text) : 
            'Sem mensagens';
        
        const time = formatTime(new Date(chat.updatedAt));
        
        html += `
            <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                <div class="chat-item-title">${chat.title}</div>
                <div class="chat-item-preview">${preview}</div>
                <div class="chat-item-time">${time}</div>
            </div>
        `;
    });
    
    chatHistory.innerHTML = html;
    
    // Adicionar event listeners aos itens
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const chatId = item.dataset.chatId;
            loadChat(chatId);
        });
        
        // Context menu para deletar
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const chatId = item.dataset.chatId;
            deleteChat(chatId);
        });
    });
}

// ===== MENSAGENS =====
function sendMessage() {
    const messageText = elements.chatInput.value.trim();
    
    if (!messageText) {
        showNotification('Por favor, digite uma mensagem', 'warning');
        return;
    }
    
    // Verificar tamanho da mensagem
    if (messageText.length > 2000) {
        showNotification('Mensagem muito longa (máximo 2000 caracteres)', 'error');
        return;
    }
    
    // Esconder mensagem de boas-vindas
    document.querySelector('.welcome-message').classList.add('hidden');
    
    // Criar objeto da mensagem do usuário
    const userMessage = {
        id: 'msg_' + Date.now(),
        text: messageText,
        sender: 'user',
        timestamp: new Date().toISOString(),
        model: selectedModel
    };
    
    // Adicionar mensagem do usuário à UI
    addMessageToUI(userMessage);
    
    // Limpar input
    elements.chatInput.value = '';
    updateCharCount();
    autoResizeTextarea();
    
    // Encontrar ou criar chat atual
    let currentChat = chats.find(c => c.id === currentChatId);
    
    if (!currentChat) {
        // Criar novo chat se não existir
        currentChatId = 'chat_' + Date.now();
        currentChat = {
            id: currentChatId,
            title: messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText,
            messages: [userMessage],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            model: selectedModel
        };
        chats.unshift(currentChat);
    } else {
        // Adicionar mensagem ao chat existente
        currentChat.messages.push(userMessage);
        currentChat.updatedAt = new Date().toISOString();
        
        // Atualizar título se for a primeira mensagem
        if (currentChat.messages.length === 1) {
            currentChat.title = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        }
    }
    
    // Salvar chats
    saveChats();
    
    // Atualizar histórico
    renderChatHistory();
    
    // Simular resposta da IA
    simulateAIResponse(messageText);
}

function simulateAIResponse(userMessage) {
    // Mostrar indicador de digitação
    showTypingIndicator();
    
    // Simular tempo de resposta
    setTimeout(() => {
        // Remover indicador
        removeTypingIndicator();
        
        // Gerar resposta baseada no modelo selecionado
        const response = generateAIResponse(userMessage, selectedModel);
        
        // Criar objeto da mensagem da IA
        const aiMessage = {
            id: 'ai_' + Date.now(),
            text: response,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            model: selectedModel
        };
        
        // Adicionar mensagem da IA à UI
        addMessageToUI(aiMessage);
        
        // Atualizar chat
        const currentChat = chats.find(c => c.id === currentChatId);
        if (currentChat) {
            currentChat.messages.push(aiMessage);
            currentChat.updatedAt = new Date().toISOString();
            saveChats();
            renderChatHistory();
        }
    }, getResponseDelay(selectedModel));
}

function generateAIResponse(userMessage, model) {
    const responses = {
        auto: [
            `Entendi sua pergunta sobre "${userMessage.substring(0, 40)}...". Como estou no modo automático, vou analisar sua solicitação e usar o modelo mais adequado.\n\n` +
            `Baseado no que você perguntou, aqui está uma resposta detalhada que combina conhecimentos de programação e criatividade para oferecer a melhor solução possível.`,
            
            `Ótima pergunta! Estou analisando sua solicitação no modo automático para fornecer a resposta mais precisa.\n\n` +
            `**Minha análise:**\n` +
            `• Identifiquei o tipo de solicitação\n` +
            `• Selecionei o modelo mais apropriado\n` +
            `• Preparei uma resposta completa\n\n` +
            `Aqui está o que você precisa saber:`
        ],
        
        claude: [
            `Como Claude, especializado em raciocínio complexo, analisei sua questão sobre "${userMessage.substring(0, 40)}...".\n\n` +
            `**Análise detalhada:**\n` +
            `1. Primeiro, vamos entender o contexto completo\n` +
            `2. Depois, explorar diferentes abordagens\n` +
            `3. Finalmente, escolher a solução mais robusta\n\n` +
            `**Minha recomendação:**\n` +
            `Baseado na minha análise, sugiro a seguinte abordagem que considera todos os aspectos importantes.`,
            
            `Excelente questão para o Claude! Vou fornecer uma análise completa.\n\n` +
            `**Considerações importantes:**\n` +
            `• Contexto e implicações\n` +
            `• Soluções alternativas\n` +
            `• Casos extremos\n` +
            `• Manutenibilidade a longo prazo\n\n` +
            `**Resposta estruturada:**\n` +
            `Aqui está uma solução bem pensada que aborda todos os pontos cruciais.`
        ],
        
        deepseek: [
            `DeepSeek analisando sua solicitação de código...\n\n` +
            `**Análise do código/problema:**\n` +
            `✅ Sintaxe verificada\n` +
            `🔍 Oportunidades de otimização identificadas\n` +
            `💡 Sugestões de melhoria:\n\n` +
            `1. **Performance:** Estruturas de dados mais eficientes\n` +
            `2. **Legibilidade:** Comentários para lógica complexa\n` +
            `3. **Tratamento de erros:** Verificação abrangente\n` +
            `4. **Testes:** Cobertura de casos extremos\n\n` +
            `**Código otimizado:**\n` +
            `Aqui está uma versão melhorada:`,
            
            `Análise DeepSeek completa!\n\n` +
            `**Avaliação técnica:**\n` +
            `• Complexidade: Média\n` +
            `• Potencial de otimização: Alto\n` +
            `• Melhores práticas: Boa aderência\n\n` +
            `**Recomendações específicas:**\n` +
            `1. Refatorar código duplicado\n` +
            `2. Implementar cache para operações caras\n` +
            `3. Usar padrões de design apropriados\n` +
            `4. Considerar uso de memória`
        ],
        
        copilot: [
            `GitHub Copilot gerando código para: "${userMessage.substring(0, 40)}..."\n\n` +
            ````javascript\n` +
            `// ${userMessage.substring(0, 30)}\n` +
            `function solução() {\n` +
            `  // Implementação baseada nos requisitos\n` +
            `  const resultado = processarSolicitação();\n` +
            `  \n` +
            `  // Tratamento de erros e validação\n` +
            `  if (!resultado) {\n` +
            `    throw new Error('Processamento falhou');\n` +
            `  }\n` +
            `  \n` +
            `  return resultado;\n` +
            `}\n` +
            `\n` +
            `// Funções auxiliares\n` +
            `function processarSolicitação() {\n` +
            `  // Lógica principal aqui\n` +
            `  return { sucesso: true, dados: 'processados' };\n` +
            `}\n` +
            ````\n\n` +
            `**Explicação:**\n` +
            `Esta implementação segue as melhores práticas com tratamento de erros adequado.`,
            
            `Aqui está uma implementação completa baseada na sua solicitação:\n\n` +
            ````python\n` +
            `#!/usr/bin/env python3\n` +
            `# ${userMessage.substring(0, 30)}\n` +
            `\n` +
            `class Solução:\n` +
            `    def __init__(self):\n` +
            `        self.dados = {}\n` +
            `    \n` +
            `    def processar(self, entrada: str) -> str:\n` +
            `        \"\"\"Processa a entrada e retorna resultado.\"\"\"\n` +
            `        # Sua lógica aqui\n` +
            `        processado = entrada.upper()\n` +
            `        return processado\n` +
            `\n` +
            `if __name__ == "__main__":\n` +
            `    solução = Solução()\n` +
            `    resultado = solução.processar("teste")\n` +
            `    print(f"Resultado: {resultado}")\n` +
            ````\n\n` +
            `Este código inclui type hints e segue as melhores práticas Python.`
        ],
        
        gemini: [
            `Gemini preparando geração de imagem para: "${userMessage.substring(0, 40)}..."\n\n` +
            `**Detalhes da geração:**\n` +
            `• Estilo: Foto-realista\n` +
            `• Resolução: 4K\n` +
            `• Proporção: 16:9\n` +
            `• Iluminação: Estúdio profissional\n` +
            `• Composição: Regra dos terços\n\n` +
            `**Prompt aprimorado:**\n` +
            `"Fotografia profissional de [seu assunto], textura detalhada, foco nítido, iluminação cinematográfica, alta resolução, 8K, ultra-realista, qualidade de estúdio, obra-prima"\n\n` +
            `Pronto para gerar esta imagem?`,
            
            `Criando imagem baseada em: "${userMessage.substring(0, 40)}..."\n\n` +
            `**Configurações do Gemini:**\n` +
            `📸 **Estilo Fotográfico:**\n` +
            `- Câmera: DSLR profissional\n` +
            `- Lente: 50mm prime\n` +
            `- Abertura: f/2.8\n` +
            `- ISO: 100\n` +
            `- Velocidade: 1/125s\n\n` +
            `🎨 **Elementos visuais:**\n` +
            `- Paleta de cores: Harmônica\n` +
            `- Contraste: Moderado\n` +
            `- Saturação: Cores naturais\n` +
            `- Nitidez: Alto detalhe`
        ],
        
        nanobanana: [
            `🎨 NanoBanana criando imagem artística para: "${userMessage.substring(0, 40)}..."\n\n` +
            `**Estilo artístico:**\n` +
            `✨ **Toque especial:**\n` +
            `- Estilo: Pintura digital\n` +
            `- Humor: Criativo e expressivo\n` +
            `- Cores: Vibrantes e imaginativas\n` +
            `- Texturas: Pinceladas artísticas\n` +
            `- Composição: Dinâmica\n\n` +
            `**Interpretação artística:**\n` +
            `Vou interpretar sua solicitação com liberdade criativa, adicionando elementos que realçam o apelo visual.\n\n` +
            `**Prompt criativo:**\n` +
            `"Pintura digital caprichosa de [seu assunto], cores vibrantes, pinceladas expressivas, elementos de fantasia, atmosfera mágica, detalhada, tendência no ArtStation, obra-prima"`,
            
            `🌟 Modo criativo NanoBanana ativado!\n\n` +
            `**Recursos criativos:**\n` +
            `🎭 **Interpretação artística:**\n` +
            `- Estilo: Mídia mista\n` +
            `- Inspiração: Fantasia e surrealismo\n` +
            `- Cores: Ousadas e não convencionais\n` +
            `- Textura: Camadas complexas\n\n` +
            `✨ **Elementos mágicos:**\n` +
            `- Efeitos brilhantes\n` +
            `- Iluminação etérea\n` +
            `- Atmosfera mística\n` +
            `- Qualidade onírica\n\n` +
            `**Resultado esperado:**\n` +
            `Uma interpretação artística única que vai além da representação literal.`
        ]
    };
    
    const modelResponses = responses[model] || responses.auto;
    return modelResponses[Math.floor(Math.random() * modelResponses.length)];
}

function getResponseDelay(model) {
    const delays = {
        'auto': 1500,
        'claude': 2000,
        'deepseek': 1200,
        'copilot': 1000,
        'gemini': 1800,
        'nanobanana': 1600
    };
    return delays[model] || 1500;
}

function addMessageToUI(message, scroll = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender}`;
    messageDiv.dataset.messageId = message.id;
    
    const time = formatTime(new Date(message.timestamp));
    
    let avatarIcon = 'fas fa-user';
    if (message.sender === 'ai') {
        avatarIcon = 'fas fa-robot';
    }
    
    let modelBadge = '';
    if (message.model && message.model !== 'auto') {
        const modelNames = {
            'claude': 'Claude',
            'deepseek': 'DeepSeek',
            'copilot': 'Copilot',
            'gemini': 'Gemini',
            'nanobanana': 'NanoBanana'
        };
        modelBadge = `<div class="message-model">${modelNames[message.model] || message.model}</div>`;
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${avatarIcon}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${formatMessageText(message.text)}</div>
            ${modelBadge}
            <div class="message-time">${time}</div>
        </div>
    `;
    
    // Adicionar ao DOM
    elements.chatMessages.appendChild(messageDiv);
    
    // Scroll para baixo
    if (scroll) {
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatMessageText(text) {
    // Converter quebras de linha
    let formatted = text.replace(/\n/g, '<br>');
    
    // Converter código entre ```
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
    });
    
    // Converter código inline entre `
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Converter **negrito**
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    return formatted;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function clearChatMessages() {
    elements.chatMessages.innerHTML = '';
}

// ===== INDICADOR DE DIGITAÇÃO =====
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message typing';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    // Adicionar estilo para os pontos
    const style = document.createElement('style');
    style.textContent = `
        .typing-dots {
            display: flex;
            gap: 4px;
            padding: 16px;
        }
        .typing-dots span {
            width: 8px;
            height: 8px;
            background-color: var(--text-muted);
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
    typingDiv.scrollIntoView({ behavior: 'smooth' });
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ===== UTILITÁRIOS =====
function updateSelectedModel() {
    selectedModel = elements.modelSelect.value;
    
    // Atualizar informação do modelo
    const modelNames = {
        'auto': 'Auto',
        'claude': 'Claude',
        'deepseek': 'DeepSeek',
        'copilot': 'Copilot',
        'gemini': 'Gemini',
        'nanobanana': 'NanoBanana'
    };
    
    elements.currentModelInfo.textContent = `Modelo: ${modelNames[selectedModel]}`;
    
    // Atualizar modelo no chat atual
    if (currentChatId) {
        const currentChat = chats.find(c => c.id === currentChatId);
        if (currentChat) {
            currentChat.model = selectedModel;
            saveChats();
        }
    }
}

function updateCharCount() {
    const length = elements.chatInput.value.length;
    elements.charCount.textContent = `${length}/2000`;
    
    // Atualizar classe baseada no tamanho
    elements.charCount.className = 'char-count';
    if (length > 1500) {
        elements.charCount.classList.add('warning');
    }
    if (length > 1800) {
        elements.charCount.classList.add('error');
    }
}

function setupAutoResize() {
    elements.chatInput.addEventListener('input', autoResizeTextarea);
    autoResizeTextarea();
}

function autoResizeTextarea() {
    elements.chatInput.style.height = 'auto';
    elements.chatInput.style.height = Math.min(elements.chatInput.scrollHeight, 200) + 'px';
}

function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} h atrás`;
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit',
        month: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Adicionar estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#10B981'};
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Adicionar animação
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
    `;
    document.head.appendChild(style);
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== EXPORTAR FUNÇÕES PARA DEBUG =====
window.app = {
    createNewChat,
    loadChat,
    deleteChat,
    sendMessage,
    chats: () => chats,
    currentChatId: () => currentChatId
};
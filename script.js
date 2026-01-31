// ===== VARIÁVEIS GLOBAIS =====
let currentChatId = null;
let chats = [];
let selectedModel = 'auto';
let useRealAPI = true;
let apiManager = window.apiManager;

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
    charCount: document.getElementById('char-count'),
    apiToggleBtn: document.getElementById('api-toggle-btn'),
    apiSettingsBtn: document.getElementById('api-settings-btn'),
    apiStatusBadge: document.getElementById('api-status-badge'),
    modelBtnMobile: document.getElementById('model-btn-mobile'),
    newChatMobile: document.getElementById('new-chat-mobile'),
    modelModal: document.getElementById('model-modal'),
    modelOptions: document.getElementById('model-options'),
    closeModelModal: document.getElementById('close-model-modal'),
    apiModal: document.getElementById('api-modal'),
    apiSettings: document.getElementById('api-settings'),
    closeApiModal: document.getElementById('close-api-modal'),
    saveApiSettings: document.getElementById('save-api-settings')
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
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
    
    // Inicializar API Manager
    if (window.apiManager) {
        // Verificar se tem API ativa
        const activeProvider = apiManager.getActiveModel();
        if (activeProvider) {
            useRealAPI = true;
            updateAPIStatusUI();
        }
    }
    
    // Se não houver chats, criar um automaticamente
    if (chats.length === 0) {
        createNewChat();
    } else {
        // Carregar o último chat
        loadChat(chats[0].id);
    }
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
    
    // Botões de API
    elements.apiToggleBtn.addEventListener('click', toggleAPIUsage);
    elements.apiSettingsBtn.addEventListener('click', showAPISettings);
    
    // Botões mobile
    elements.modelBtnMobile.addEventListener('click', showMobileModelSelector);
    elements.newChatMobile.addEventListener('click', createNewChat);
    
    // Modals
    elements.closeModelModal.addEventListener('click', () => closeModal('model-modal'));
    elements.closeApiModal.addEventListener('click', () => closeModal('api-modal'));
    elements.saveApiSettings.addEventListener('click', saveAPISettings);
    
    // Botões de prompt rápido
    document.querySelectorAll('.prompt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prompt = e.currentTarget.dataset.prompt;
            elements.chatInput.value = prompt;
            elements.chatInput.focus();
            updateCharCount();
            autoResizeTextarea();
            
            // Esconder mensagem de boas-vindas
            const welcomeMsg = document.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.classList.add('hidden');
            }
        });
    });
    
    // Fechar modal ao clicar fora
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('model-modal')) {
            e.target.classList.remove('show');
        }
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
    try {
        const savedChats = localStorage.getItem('neuralink_chats');
        if (savedChats) {
            chats = JSON.parse(savedChats);
            console.log('Chats carregados:', chats.length);
        } else {
            chats = [];
            console.log('Nenhum chat salvo encontrado');
        }
    } catch (error) {
        console.error('Erro ao carregar chats:', error);
        chats = [];
    }
}

function saveChats() {
    try {
        localStorage.setItem('neuralink_chats', JSON.stringify(chats));
        console.log('Chats salvos:', chats.length);
    } catch (error) {
        console.error('Erro ao salvar chats:', error);
    }
}

function createNewChat() {
    console.log('Criando novo chat...');
    
    // Criar novo ID único
    currentChatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Criar objeto do chat
    const newChat = {
        id: currentChatId,
        title: 'Novo chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        model: selectedModel
    };
    
    console.log('Novo chat criado:', newChat);
    
    // Adicionar ao início da lista
    chats.unshift(newChat);
    
    // Salvar no LocalStorage
    saveChats();
    
    // Renderizar histórico
    renderChatHistory();
    
    // Limpar área de mensagens
    clearChatMessages();
    
    // Mostrar mensagem de boas-vindas
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.classList.remove('hidden');
    }
    
    // Atualizar modelo selecionado
    elements.modelSelect.value = selectedModel;
    updateSelectedModel();
    
    // Fechar sidebar no mobile
    closeMobileSidebar();
    
    // Fechar modais
    closeModal('model-modal');
    
    // Focar no input
    elements.chatInput.focus();
    
    // Mostrar notificação
    showNotification('Novo chat criado!', 'success');
}

function loadChat(chatId) {
    console.log('Carregando chat:', chatId);
    
    const chat = chats.find(c => c.id === chatId);
    if (!chat) {
        console.error('Chat não encontrado:', chatId);
        createNewChat();
        return;
    }
    
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
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.classList.remove('hidden');
        }
    } else {
        // Esconder mensagem de boas-vindas
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.classList.add('hidden');
        }
        
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
    
    console.log('Chat carregado com sucesso');
}

function deleteChat(chatId, event) {
    if (event) event.preventDefault();
    
    if (!confirm('Tem certeza que deseja excluir este chat?')) return;
    
    console.log('Excluindo chat:', chatId);
    
    // Remover da lista
    const initialLength = chats.length;
    chats = chats.filter(c => c.id !== chatId);
    
    // Salvar no LocalStorage
    saveChats();
    
    // Se era o chat atual, criar novo
    if (currentChatId === chatId) {
        if (chats.length > 0) {
            loadChat(chats[0].id);
        } else {
            createNewChat();
        }
    } else {
        renderChatHistory();
    }
    
    showNotification('Chat excluído!', 'success');
    console.log('Chat excluído. Antes:', initialLength, 'Depois:', chats.length);
}

function renderChatHistory() {
    const chatHistory = elements.chatHistory;
    
    if (!chatHistory) {
        console.error('Elemento chat-history não encontrado');
        return;
    }
    
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
        const title = chat.title || 'Chat sem título';
        
        html += `
            <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                <div class="chat-item-title">${title}</div>
                <div class="chat-item-preview">${preview}</div>
                <div class="chat-item-time">${time}</div>
            </div>
        `;
    });
    
    chatHistory.innerHTML = html;
    
    // Adicionar event listeners aos itens
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const chatId = item.dataset.chatId;
            loadChat(chatId);
        });
        
        // Context menu para deletar (clique direito)
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const chatId = item.dataset.chatId;
            deleteChat(chatId, e);
        });
        
        // Clique longo no mobile (opcional)
        let pressTimer;
        item.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                const chatId = item.dataset.chatId;
                deleteChat(chatId, e);
            }, 1000); // 1 segundo
        });
        
        item.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
    });
    
    console.log('Histórico renderizado:', sortedChats.length, 'chats');
}

// ===== MENSAGENS =====
async function sendMessage() {
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
    
    // Se não houver chat atual, criar um
    if (!currentChatId || !chats.find(c => c.id === currentChatId)) {
        console.log('Nenhum chat ativo, criando novo...');
        createNewChat();
    }
    
    // Esconder mensagem de boas-vindas
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.classList.add('hidden');
    }
    
    // Criar objeto da mensagem do usuário
    const userMessage = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        text: messageText,
        sender: 'user',
        timestamp: new Date().toISOString(),
        model: selectedModel
    };
    
    console.log('Enviando mensagem:', userMessage);
    
    // Adicionar mensagem do usuário à UI
    addMessageToUI(userMessage);
    
    // Limpar input
    elements.chatInput.value = '';
    updateCharCount();
    autoResizeTextarea();
    
    // Encontrar chat atual
    let currentChat = chats.find(c => c.id === currentChatId);
    
    if (!currentChat) {
        console.error('Chat atual não encontrado, criando novo...');
        createNewChat();
        currentChat = chats.find(c => c.id === currentChatId);
    }
    
    // Adicionar mensagem ao chat
    currentChat.messages.push(userMessage);
    currentChat.updatedAt = new Date().toISOString();
    
    // Atualizar título se for a primeira mensagem
    if (currentChat.messages.length === 1) {
        currentChat.title = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
    }
    
    // Salvar chats
    saveChats();
    
    // Atualizar histórico
    renderChatHistory();
    
    // Obter resposta da IA
    await getAIResponse(messageText);
}


            async function getAIResponse(userMessage) {
    console.log('Obtendo resposta para:', userMessage.substring(0, 50));
    
    // Mostrar indicador de digitação
    showTypingIndicator();
    
    try {
        let response;
        let isRealAPI = false;
        
        // Verificar se deve usar API real
        if (useRealAPI && window.apiManager) {
            const activeProvider = apiManager.getActiveModel();
            if (activeProvider) {
                console.log('Usando API real:', activeProvider.name);
                isRealAPI = true;
                
                // Usar API REAL sem fallback para simulado
                try {
                    response = await apiManager.sendRequest(userMessage);
                } catch (apiError) {
                    console.error('Erro na API real:', apiError);
                    // Se API falhar, mostra erro direto
                    throw new Error(`API Error: ${apiError.message}`);
                }
                
            } else {
                console.log('Nenhuma API ativa, usando resposta simulada');
                isRealAPI = false;
                response = await generateSimulatedResponse(userMessage);
            }
        } else {
            console.log('Usando resposta simulada');
            isRealAPI = false;
            response = await generateSimulatedResponse(userMessage);
        }
        
        // Remover indicador
        removeTypingIndicator();
        
        // Criar objeto da mensagem da IA
        const aiMessage = {
            id: 'ai_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: response,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            model: selectedModel,
            isRealAPI: isRealAPI
        };
        
        console.log('Resposta da IA gerada:', aiMessage.id);
        
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
        
    } catch (error) {
        console.error('Erro ao obter resposta:', error);
        removeTypingIndicator();
        
        // Mostrar erro específico
        const errorMessage = error.message.includes('API Error') 
            ? `Erro na API: ${error.message.replace('API Error: ', '')}`
            : 'Erro ao obter resposta da IA';
            
        showNotification(errorMessage, 'error');
        
        // Opcional: adicionar mensagem de erro no chat
        const errorResponse = `❌ **Erro na API DeepSeek:**\n\n${error.message}\n\nTente novamente ou verifique sua API Key.`;
        
        const errorMessageObj = {
            id: 'ai_error_' + Date.now(),
            text: errorResponse,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            model: selectedModel,
            isRealAPI: false,
            isError: true
        };
        
        addMessageToUI(errorMessageObj);
        
        const currentChat = chats.find(c => c.id === currentChatId);
        if (currentChat) {
            currentChat.messages.push(errorMessageObj);
            currentChat.updatedAt = new Date().toISOString();
            saveChats();
            renderChatHistory();
        }
    }
}
        


async function generateSimulatedResponse(userMessage) {
    return new Promise(resolve => {
        const delay = getResponseDelay(selectedModel);
        setTimeout(() => {
            resolve(generateAIResponse(userMessage, selectedModel));
        }, delay);
    });
}

function generateAIResponse(userMessage, model) {
    const responses = {
        auto: [
            `Entendi sua pergunta sobre "${userMessage.substring(0, 40)}...". Como estou no modo automático, selecionei o modelo mais adequado para responder.\n\n` +
            `Baseado na minha análise, aqui está uma resposta completa que combina diferentes conhecimentos para oferecer a melhor solução possível.\n\n` +
            `Se precisar de mais detalhes ou uma abordagem diferente, é só me avisar!`,
            
            `Ótima pergunta! Estou no modo automático, então analisei sua solicitação e escolhi a melhor forma de responder.\n\n` +
            `**Minha análise:**\n` +
            `• Identifiquei o tipo de solicitação\n` +
            `• Selecionei o modelo mais apropriado\n` +
            `• Preparei uma resposta completa\n\n` +
            `Aqui está o que você precisa saber:\n` +
            `A resposta foi gerada considerando as melhores práticas e soluções mais eficientes para o seu caso.`
        ],
        
        claude: [
            `Como Claude, especializado em raciocínio complexo, analisei profundamente sua questão sobre "${userMessage.substring(0, 40)}...".\n\n` +
            `**Análise detalhada:**\n` +
            `1. Primeiro, entendi completamente o contexto\n` +
            `2. Depois, explorei diferentes abordagens possíveis\n` +
            `3. Avaliei os prós e contras de cada uma\n` +
            `4. Finalmente, selecionei a solução mais robusta\n\n` +
            `**Minha recomendação:**\n` +
            `Baseado na minha análise, sugiro a seguinte abordagem que considera todos os aspectos importantes.`,
            
            `Excelente questão para o Claude! Posso ver que você está procurando uma análise profunda.\n\n` +
            `**Considerações importantes:**\n` +
            `• Contexto completo e implicações\n` +
            `• Soluções alternativas viáveis\n` +
            `• Casos extremos e tratamento de erros\n` +
            `• Manutenibilidade a longo prazo\n\n` +
            `**Resposta estruturada:**\n` +
            `Aqui está uma solução bem pensada que aborda todos os pontos cruciais de forma clara e organizada.`
        ],
        
        deepseek: [
            `🔍 DeepSeek analisando sua solicitação de código...\n\n` +
            `**Análise técnica:**\n` +
            `✅ Sintaxe verificada\n` +
            `✅ Estrutura avaliada\n` +
            `🔍 Oportunidades de otimização identificadas\n` +
            `💡 Sugestões de melhoria:\n\n` +
            `1. **Performance:** Podemos usar estruturas de dados mais eficientes\n` +
            `2. **Legibilidade:** Adicionar comentários para lógica complexa\n` +
            `3. **Tratamento de erros:** Implementar verificação mais abrangente\n` +
            `4. **Testes:** Melhorar cobertura de casos extremos\n\n` +
            `**Código otimizado:**\n` +
            `Com base na análise, aqui está uma versão melhorada.`,
            
            `🚀 Análise DeepSeek completa!\n\n` +
            `**Avaliação técnica detalhada:**\n` +
            `• Complexidade: Média\n` +
            `• Potencial de otimização: Alto\n` +
            `• Adesão às melhores práticas: Boa\n` +
            `• Manutenibilidade: Excelente\n\n` +
            `**Recomendações específicas:**\n` +
            `1. Refatorar código duplicado em funções reutilizáveis\n` +
            `2. Implementar cache para operações computacionalmente caras\n` +
            `3. Usar padrões de design apropriados para escalabilidade\n` +
            `4. Considerar uso de memória e garbage collection`
        ],
        
        copilot: [
            `💻 GitHub Copilot gerando solução para: "${userMessage.substring(0, 40)}..."\n\n` +
            `\`\`\`javascript\n` +
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
            `\`\`\`\n\n` +
            `**Explicação:**\n` +
            `Esta implementação segue as melhores práticas com tratamento de erros adequado e estrutura modular.`,
            
            `👨‍💻 Aqui está uma implementação completa baseada na sua solicitação:\n\n` +
            `\`\`\`python\n` +
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
            `\`\`\`\n\n` +
            `**Características:**\n` +
            `• Type hints para melhor verificação\n` +
            `• Documentação adequada\n` +
            `• Boas práticas Python\n` +
            `• Fácil de testar e manter`
        ],
        
        gemini: [
            `🖼️ Gemini preparando geração de imagem para: "${userMessage.substring(0, 40)}..."\n\n` +
            `**Detalhes da geração:**\n` +
            `• Estilo: Foto-realista\n` +
            `• Resolução: 4K (3840x2160)\n` +
            `• Proporção: 16:9\n` +
            `• Iluminação: Estúdio profissional\n` +
            `• Composição: Regra dos terços\n` +
            `• Profundidade de campo: Baixa para foco seletivo\n\n` +
            `**Prompt aprimorado para melhores resultados:**\n` +
            `"Fotografia profissional de [seu assunto], textura detalhada, foco nítido, iluminação cinematográfica, alta resolução, 8K, ultra-realista, qualidade de estúdio, obra-prima, tendência no ArtStation"\n\n` +
            `Pronto para gerar esta imagem incrível?`,
            
            `📸 Criando imagem baseada em: "${userMessage.substring(0, 40)}..."\n\n` +
            `**Configurações avançadas do Gemini:**\n` +
            `📷 **Configurações da câmera:**\n` +
            `- Modelo: DSLR profissional\n` +
            `- Lente: 50mm prime f/1.8\n` +
            `- Abertura: f/2.8 para bokeh suave\n` +
            `- ISO: 100 para baixo ruído\n` +
            `- Velocidade do obturador: 1/125s\n` +
            `- Balanço de branco: Daylight\n\n` +
            `🎨 **Elementos visuais e estilo:**\n` +
            `- Paleta de cores: Harmônica e equilibrada\n` +
            `- Contraste: Moderado para look natural\n` +
            `- Saturação: Cores verdadeiras à vida\n` +
            `- Nitidez: Alto detalhe e textura\n` +
            `- Atmosfera: Profissional e envolvente`
        ],
        
        nanobanana: [
            `🎨 NanoBanana criando imagem artística para: "${userMessage.substring(0, 40)}..."\n\n` +
            `**Estilo artístico único:**\n` +
            `✨ **Características especiais:**\n` +
            `- Técnica: Pintura digital mista\n` +
            `- Humor: Criativo, expressivo e imaginativo\n` +
            `- Esquema de cores: Vibrante e não convencional\n` +
            `- Texturas: Pinceladas visíveis, estilo impressionista\n` +
            `- Composição: Dinâmica e quebra regras\n` +
            `- Inspiração: Arte fantasia e surrealismo\n\n` +
            `**Interpretação artística livre:**\n` +
            `Vou interpretar sua ideia com liberdade criativa total, adicionando elementos surpreendentes que realçam o apelo visual emocional.\n\n` +
            `**Prompt criativo ideal:**\n` +
            `"Pintura digital caprichosa de [seu assunto], cores vibrantes explosivas, pinceladas expressivas grossas, elementos de fantasia mágica, atmosfera onírica, detalhada, estilo ArtStation trending, masterpiece digital art"`
        ]
    };
    
    const modelResponses = responses[model] || responses.auto;
    return modelResponses[Math.floor(Math.random() * modelResponses.length)];
}

function getResponseDelay(model) {
    const delays = {
        'auto': 1200,
        'claude': 1800,
        'deepseek': 1000,
        'copilot': 800,
        'gemini': 1500,
        'nanobanana': 1400
    };
    return delays[model] || 1200;
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
        const badgeText = message.isRealAPI ? 
            `${modelNames[message.model] || message.model} (API)` : 
            `${modelNames[message.model] || message.model}`;
        
        modelBadge = `<div class="message-model">${badgeText}</div>`;
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
    // Remover indicador existente se houver
    removeTypingIndicator();
    
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
    
    elements.chatMessages.appendChild(typingDiv);
    typingDiv.scrollIntoView({ behavior: 'smooth' });
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ===== GERENCIAMENTO DE API =====
function toggleAPIUsage() {
    if (!window.apiManager) {
        showNotification('API Manager não carregado', 'error');
        return;
    }
    
    const activeProvider = apiManager.getActiveModel();
    
    if (!activeProvider && useRealAPI === false) {
        showNotification('Configure pelo menos uma API primeiro!', 'warning');
        showAPISettings();
        return;
    }
    
    useRealAPI = !useRealAPI;
    const status = useRealAPI ? 'ativadas' : 'desativadas';
    showNotification(`APIs reais ${status}`, 'success');
    updateAPIStatusUI();
}

function updateAPIStatusUI() {
    if (!elements.apiToggleBtn || !elements.apiStatusBadge) return;
    
    elements.apiToggleBtn.innerHTML = useRealAPI ? 
        '<i class="fas fa-plug"></i>' : 
        '<i class="fas fa-plug-circle-xmark"></i>';
    
    elements.apiToggleBtn.title = useRealAPI ? 'APIs reais ativas' : 'APIs reais inativas';
    
    elements.apiStatusBadge.textContent = useRealAPI ? 'API Real' : 'Simulado';
    elements.apiStatusBadge.className = `api-status-badge ${useRealAPI ? 'active' : 'inactive'}`;
}

function showAPISettings() {
    if (!elements.apiModal || !elements.apiSettings || !window.apiManager) return;
    
    let html = '';
    
    Object.entries(apiManager.config).forEach(([key, provider]) => {
        html += `
            <div class="api-provider" data-provider="${key}">
                <div class="api-provider-header">
                    <h4>${provider.name}</h4>
                    <label class="switch">
                        <input type="checkbox" 
                               data-provider="${key}" 
                               ${provider.enabled ? 'checked' : ''}
                               onchange="toggleProvider('${key}', this.checked)">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="api-provider-body ${provider.enabled ? 'show' : ''}">
                    <div class="form-group">
                        <label>API Key:</label>
                        <input type="password" 
                               data-provider="${key}" 
                               class="api-key-input"
                               value="${provider.apiKey || ''}"
                               placeholder="Insira sua API key">
                    </div>
                    <div class="form-group">
                        <label>Modelo:</label>
                        <input type="text"
                               data-provider="${key}"
                               class="api-model-input"
                               value="${provider.model || ''}"
                               placeholder="Ex: gpt-3.5-turbo">
                    </div>
                    <div class="form-group">
                        <label>URL Base:</label>
                        <input type="text"
                               data-provider="${key}"
                               class="api-url-input"
                               value="${provider.baseUrl || ''}"
                               placeholder="URL da API">
                    </div>
                </div>
            </div>
        `;
    });
    
    elements.apiSettings.innerHTML = html;
    elements.apiModal.classList.add('show');
}

function toggleProvider(providerKey, enabled) {
    if (!window.apiManager) return;
    
    apiManager.config[providerKey].enabled = enabled;
    const body = document.querySelector(`.api-provider-body[data-provider="${providerKey}"]`);
    if (body) {
        body.classList.toggle('show', enabled);
    }
}

function saveAPISettings() {
    if (!window.apiManager) {
        showNotification('API Manager não carregado', 'error');
        return;
    }
    
    // Coletar dados dos inputs
    document.querySelectorAll('.api-key-input').forEach(input => {
        const provider = input.dataset.provider;
        apiManager.config[provider].apiKey = input.value.trim();
    });
    
    document.querySelectorAll('.api-model-input').forEach(input => {
        const provider = input.dataset.provider;
        apiManager.config[provider].model = input.value.trim();
    });
    
    document.querySelectorAll('.api-url-input').forEach(input => {
        const provider = input.dataset.provider;
        apiManager.config[provider].baseUrl = input.value.trim();
    });
    
    // Salvar configurações
    if (apiManager.saveConfig()) {
        showNotification('Configurações salvas!', 'success');
        closeModal('api-modal');
        
        // Verificar se algum provedor está ativo
        const hasActiveProvider = Object.values(apiManager.config).some(p => 
            p.enabled && p.apiKey.trim()
        );
        
        if (hasActiveProvider) {
            useRealAPI = true;
            showNotification('APIs reais ativadas automaticamente!', 'success');
        }
        
        updateAPIStatusUI();
    } else {
        showNotification('Erro ao salvar configurações', 'error');
    }
}

function showMobileModelSelector() {
    if (!elements.modelModal || !elements.modelOptions) return;
    
    const modelOptions = {
        'auto': { name: 'Auto', icon: 'fas fa-robot', description: 'Seleção automática' },
        'claude': { name: 'Claude', icon: 'fas fa-brain', description: 'Raciocínio complexo' },
        'deepseek': { name: 'DeepSeek', icon: 'fas fa-code', description: 'Programação' },
        'copilot': { name: 'Copilot', icon: 'fab fa-github', description: 'Desenvolvimento' },
        'gemini': { name: 'Gemini', icon: 'fas fa-image', description: 'Imagens e visão' },
        'nanobanana': { name: 'NanoBanana', icon: 'fas fa-palette', description: 'Arte criativa' }
    };
    
    let html = '';
    
    Object.entries(modelOptions).forEach(([key, model]) => {
        const isActive = key === selectedModel;
        html += `
            <div class="model-option ${isActive ? 'active' : ''}" data-model="${key}">
                <div>
                    <i class="${model.icon}"></i>
                    <span>${model.name}</span>
                </div>
                <div>
                    <span class="model-badge">${model.description}</span>
                </div>
            </div>
        `;
    });
    
    elements.modelOptions.innerHTML = html;
    
    // Adicionar event listeners
    document.querySelectorAll('.model-option').forEach(option => {
        option.addEventListener('click', () => {
            const model = option.dataset.model;
            selectedModel = model;
            elements.modelSelect.value = model;
            updateSelectedModel();
            closeModal('model-modal');
            showNotification(`Modelo alterado para ${modelOptions[model].name}`, 'success');
        });
    });
    
    elements.modelModal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
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
            currentChat.updatedAt = new Date().toISOString();
            saveChats();
            renderChatHistory();
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
    if (diffHours < 24) return `${diffHours}h atrás`;
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
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== DEBUG/DEV TOOLS =====
function clearAllData() {
    if (confirm('TEM CERTEZA? Isso vai apagar TODOS os chats permanentemente.')) {
        localStorage.removeItem('neuralink_chats');
        localStorage.removeItem('neuralink_api_config');
        chats = [];
        currentChatId = null;
        clearChatMessages();
        renderChatHistory();
        createNewChat();
        showNotification('Todos os dados foram apagados', 'success');
    }
}

// Adicionar botão de limpeza no console para desenvolvimento
console.log('%cNeuraLink AI Debug', 'color: #7C3AED; font-size: 16px; font-weight: bold;');
console.log('Comandos disponíveis:');
console.log('- app.createNewChat() - Criar novo chat');
console.log('- app.chats() - Ver todos os chats');
console.log('- clearAllData() - Limpar todos os dados (CUIDADO!)');
console.log('- localStorage.clear() - Limpar LocalStorage');
console.log('- apiManager - Gerenciador de APIs');

// ===== EXPORTAR FUNÇÕES PARA DEBUG =====
window.app = {
    createNewChat,
    loadChat,
    deleteChat,
    sendMessage,
    chats: () => chats,
    currentChatId: () => currentChatId,
    clearAllData,
    toggleAPIUsage,
    showAPISettings
};

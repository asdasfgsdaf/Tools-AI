// ===== CONFIGURAÇÕES DE API =====
class APIManager {
    constructor() {
        this.config = this.loadConfig();
    }
    
    loadConfig() {
        try {
            const saved = localStorage.getItem('neuralink_api_config');
            return saved ? JSON.parse(saved) : this.getDefaultConfig();
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return this.getDefaultConfig();
        }
    }
    
    getDefaultConfig() {
        return {
            openai: {
                name: 'OpenAI',
                baseUrl: 'https://api.openai.com/v1',
                apiKey: '',
                enabled: false,
                model: 'gpt-3.5-turbo'
            },
            anthropic: {
                name: 'Claude (Anthropic)',
                baseUrl: 'https://api.anthropic.com/v1',
                apiKey: '',
                enabled: false,
                model: 'claude-3-haiku-20240307'
            },
            deepseek: {
                name: 'DeepSeek',
                baseUrl: 'https://api.deepseek.com/v1',
                apiKey: 'sk-8f289f32e9d94d1a89395bad40e0b4ab',
                enabled: false,
                model: 'deepseek-chat'
            },
            gemini: {
                name: 'Gemini (Google)',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                apiKey: '',
                enabled: false,
                model: 'gemini-pro'
            },
            groq: {
                name: 'Groq',
                baseUrl: 'https://api.groq.com/openai/v1',
                apiKey: '',
                enabled: false,
                model: 'llama3-70b-8192'
            },
            openrouter: {
                name: 'OpenRouter',
                baseUrl: 'https://openrouter.ai/api/v1',
                apiKey: '',
                enabled: false,
                model: 'openai/gpt-3.5-turbo'
            }
        };
    }
    
    saveConfig() {
        try {
            localStorage.setItem('neuralink_api_config', JSON.stringify(this.config));
            return true;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return false;
        }
    }
    
    getActiveModel() {
        // Retorna o primeiro modelo com API key configurada
        for (const [key, provider] of Object.entries(this.config)) {
            if (provider.enabled && provider.apiKey.trim()) {
                return { key, ...provider };
            }
        }
        return null;
    }
    
    async sendRequest(message, providerKey = null) {
        const provider = providerKey ? this.config[providerKey] : this.getActiveModel();
        
        if (!provider || !provider.enabled || !provider.apiKey.trim()) {
            throw new Error('Nenhuma API configurada ou ativada');
        }
        
        switch (providerKey || provider.key) {
            case 'openai':
            case 'deepseek':
            case 'groq':
            case 'openrouter':
                return this.sendOpenAIRequest(message, provider);
            case 'anthropic':
                return this.sendAnthropicRequest(message, provider);
            case 'gemini':
                return this.sendGeminiRequest(message, provider);
            default:
                throw new Error('Provedor não suportado');
        }
    }
    
    async sendOpenAIRequest(message, provider) {
        try {
            const response = await fetch(`${provider.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${provider.apiKey}`
                },
                body: JSON.stringify({
                    model: provider.model,
                    messages: [
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Erro na API');
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('Erro OpenAI:', error);
            throw error;
        }
    }
    
    async sendAnthropicRequest(message, provider) {
        try {
            const response = await fetch(`${provider.baseUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': provider.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: provider.model,
                    max_tokens: 1000,
                    messages: [
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Erro na API');
            }
            
            const data = await response.json();
            return data.content[0].text;
            
        } catch (error) {
            console.error('Erro Anthropic:', error);
            throw error;
        }
    }
    
    async sendGeminiRequest(message, provider) {
        try {
            const response = await fetch(
                `${provider.baseUrl}/models/${provider.model}:generateContent?key=${provider.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: message
                            }]
                        }]
                    })
                }
            );
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Erro na API');
            }
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
            
        } catch (error) {
            console.error('Erro Gemini:', error);
            throw error;
        }
    }
    
    // Para geração de imagens (usando OpenAI DALL-E como exemplo)
    async generateImage(prompt, provider = 'openai') {
        const config = this.config[provider];
        
        if (!config || !config.enabled || !config.apiKey.trim()) {
            throw new Error('API não configurada para geração de imagens');
        }
        
        try {
            const response = await fetch(`${config.baseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024"
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Erro na API');
            }
            
            const data = await response.json();
            return data.data[0].url;
            
        } catch (error) {
            console.error('Erro na geração de imagem:', error);
            throw error;
        }
    }
    
    // Verificar status das APIs
    async checkAPIStatus() {
        const status = {};
        
        for (const [key, provider] of Object.entries(this.config)) {
            if (provider.enabled && provider.apiKey.trim()) {
                try {
                    switch (key) {
                        case 'openai':
                        case 'deepseek':
                        case 'groq':
                        case 'openrouter':
                            await this.sendOpenAIRequest('Hello', provider);
                            status[key] = 'online';
                            break;
                        case 'anthropic':
                            await this.sendAnthropicRequest('Hello', provider);
                            status[key] = 'online';
                            break;
                        case 'gemini':
                            await this.sendGeminiRequest('Hello', provider);
                            status[key] = 'online';
                            break;
                        default:
                            status[key] = 'unknown';
                    }
                } catch (error) {
                    status[key] = 'offline';
                }
            } else {
                status[key] = 'disabled';
            }
        }
        
        return status;
    }
}

// ===== INSTÂNCIA GLOBAL =====
window.apiManager = new APIManager();

// Funções auxiliares globais
window.toggleProvider = function(providerKey, enabled) {
    if (window.apiManager) {
        window.apiManager.config[providerKey].enabled = enabled;
        const body = document.querySelector(`.api-provider-body[data-provider="${providerKey}"]`);
        if (body) {
            body.classList.toggle('show', enabled);
        }
    }
};

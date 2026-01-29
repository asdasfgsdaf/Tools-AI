// ===== LANGUAGE MANAGER =====
class LanguageManager {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.langChangeCallbacks = [];
        this.init();
    }

    async init() {
        // Load translations
        await this.loadTranslations();
        
        // Try to get saved language preference
        const savedLang = localStorage.getItem('neuralink_language');
        if (savedLang && this.translations[savedLang]) {
            this.currentLang = savedLang;
        }
        
        // Apply language immediately
        this.applyLanguage();
        
        // Set up language selector events
        this.setupLanguageSelectors();
        
        console.log('LanguageManager initialized with language:', this.currentLang);
    }

    async loadTranslations() {
        // In a production app, you would load these from JSON files
        // For now, we'll define them inline
        this.translations = {
            en: this.getEnglishTranslations(),
            pt: this.getPortugueseTranslations(),
            es: this.getSpanishTranslations(),
            fr: this.getFrenchTranslations(),
            de: this.getGermanTranslations()
        };
    }

    getEnglishTranslations() {
        return {
            // Navigation
            "nav.features": "Features",
            "nav.pricing": "Pricing",
            "nav.launch": "Launch Chat",
            "nav.home": "Home",
            "nav.how": "How it Works",
            
            // Hero Section
            "hero.badge": "All AI Models Unified",
            "hero.title1": "One Platform.",
            "hero.title2": "Every AI.",
            "hero.subtitle": "Claude, DeepSeek, GitHub Copilot, Gemini & NanoBanana",
            "hero.highlight": "unified in one intelligent assistant",
            "hero.description": "From code generation to image creation, NeuraLink AI intelligently routes your requests to the perfect AI model. No switching between tools. No context loss. Just pure productivity.",
            "hero.startChat": "Start Chat Now",
            "hero.watchDemo": "Watch Demo",
            "hero.stats.ai": "AI Models",
            "hero.stats.languages": "Languages",
            "hero.stats.possibilities": "Possibilities",
            
            // Features
            "features.title": "Why Choose NeuraLink AI",
            "features.subtitle": "Intelligent AI",
            "features.subtitle2": "Routing",
            "features.description": "We analyze your request and automatically select the best AI model for the task",
            "feature1.title": "Programming",
            "feature1.desc": "Automatically routed to Claude, DeepSeek, or Copilot based on code complexity",
            "feature2.title": "Image Generation",
            "feature2.desc": "Gemini for realistic images, NanoBanana for creative and artistic styles",
            "feature3.title": "Multi-Language",
            "feature3.desc": "Full support in 5 languages. Chat in your native language seamlessly",
            "feature4.title": "Context Memory",
            "feature4.desc": "Maintains conversation context across different AI models and sessions",
            
            // How it Works
            "how.title": "How",
            "how.title2": "NeuraLink AI",
            "how.title3": "Works",
            "how.subtitle": "Three simple steps to supercharge your productivity",
            "step1.title": "Type Your Request",
            "step1.desc": "Simply type what you need - code, images, explanations, or creative ideas",
            "step2.title": "AI Model Selection",
            "step2.desc": "Our system analyzes your request and picks the perfect AI model automatically",
            "step3.title": "Get Perfect Results",
            "step3.desc": "Receive optimized responses from the best AI for your specific task",
            
            // CTA
            "cta.title": "Ready to Experience Unified AI?",
            "cta.subtitle": "Join thousands of developers and creatives using NeuraLink AI",
            "cta.launch": "Launch NeuraLink AI",
            "cta.note": "Secure & Private • No credit card required",
            
            // Footer
            "footer.tagline": "One platform. Every AI. Infinite possibilities.",
            "footer.product": "Product",
            "footer.resources": "Resources",
            "footer.legal": "Legal",
            "footer.built": "Built with Firebase & AI Magic",
            "footer.copyright": "© 2024 NeuraLink AI. All rights reserved.",
            
            // Chat
            "chat.back": "Back to Home",
            "chat.subtitle": "Unified Intelligence Chat",
            "chat.welcome.title": "Welcome to NeuraLink AI",
            "chat.welcome.subtitle": "Your unified assistant for programming and image generation",
            "chat.welcome.code": "Code Generation",
            "chat.welcome.codeModels": "Claude, DeepSeek & Copilot",
            "chat.welcome.image": "Image Creation",
            "chat.welcome.imageModels": "Gemini & NanoBanana",
            "chat.welcome.language": "Multi-Language",
            "chat.welcome.languageSupport": "5 languages supported",
            "chat.welcome.try": "Try asking:",
            "chat.welcome.example1": "\"Create a React login component\"",
            "chat.welcome.example2": "\"Generate a futuristic cityscape\"",
            "chat.welcome.example3": "\"Explain async/await in JavaScript\"",
            "chat.welcome.example4": "\"Debug this Python function\"",
            
            // Chat Input
            "chat.input.placeholder": "Type your message here... (Press Enter to send, Shift+Enter for new line)",
            "chat.input.send": "Send",
            "chat.input.attachments": "Attachments",
            "chat.input.clear": "Clear",
            "chat.input.export": "Export",
            "chat.input.guest": "Guest Mode",
            "chat.input.code": "Code",
            "chat.input.image": "Image",
            "chat.input.debug": "Debug",
            "chat.input.explain": "Explain",
            "chat.input.translate": "Translate",
            
            // Model Selector
            "model.auto": "Auto-select",
            "model.auto.desc": "Intelligent routing",
            "model.claude": "Claude",
            "model.claude.desc": "Advanced reasoning",
            "model.deepseek": "DeepSeek",
            "model.deepseek.desc": "Code optimization",
            "model.copilot": "GitHub Copilot",
            "model.copilot.desc": "Code generation",
            "model.gemini": "Gemini",
            "model.gemini.desc": "Realistic images",
            "model.nanobanana": "NanoBanana",
            "model.nanobanana.desc": "Creative & artistic",
            
            // Settings
            "settings.title": "Settings",
            "settings.ai": "AI Preferences",
            "settings.defaultModel": "Default AI Model",
            "settings.responseSpeed": "Response Speed",
            "settings.fast": "Fast",
            "settings.balanced": "Balanced",
            "settings.quality": "Quality",
            "settings.personalization": "Personalization",
            "settings.interfaceLang": "Interface Language",
            "settings.theme": "Theme",
            "settings.dark": "Dark",
            "settings.light": "Light",
            "settings.auto": "Auto",
            "settings.privacy": "Privacy",
            "settings.saveHistory": "Save Chat History",
            "settings.improvement": "Improvement Data",
            "settings.improvementDesc": "Help improve NeuraLink AI by sharing anonymous usage data",
            "settings.save": "Save Settings",
            "settings.reset": "Reset",
            
            // History
            "history.title": "Chat History",
            "history.search": "Search chats...",
            "history.all": "All",
            "history.code": "Code",
            "history.image": "Images",
            "history.saved": "Saved",
            "history.empty": "No chat history yet",
            "history.emptyDesc": "Start a conversation to see your history here",
            "history.clear": "Clear All",
            "history.storage": "1.2 GB / 5 GB",
            
            // Status
            "status.ready": "NeuraLink AI is ready",
            
            // Notifications
            "notification.success": "Success",
            "notification.error": "Error",
            "notification.warning": "Warning",
            "notification.info": "Info"
        };
    }

    getPortugueseTranslations() {
        return {
            // Navigation
            "nav.features": "Recursos",
            "nav.pricing": "Preços",
            "nav.launch": "Abrir Chat",
            "nav.home": "Início",
            "nav.how": "Como Funciona",
            
            // Hero Section
            "hero.badge": "Todos os Modelos de IA Unificados",
            "hero.title1": "Uma Plataforma.",
            "hero.title2": "Toda IA.",
            "hero.subtitle": "Claude, DeepSeek, GitHub Copilot, Gemini & NanoBanana",
            "hero.highlight": "unificados em um assistente inteligente",
            "hero.description": "Da geração de código à criação de imagens, o NeuraLink AI encaminha inteligentemente suas solicitações para o modelo de IA perfeito. Sem alternar entre ferramentas. Sem perda de contexto. Apenas produtividade pura.",
            "hero.startChat": "Iniciar Chat Agora",
            "hero.watchDemo": "Ver Demonstração",
            "hero.stats.ai": "Modelos de IA",
            "hero.stats.languages": "Idiomas",
            "hero.stats.possibilities": "Possibilidades",
            
            // Features
            "features.title": "Por que Escolher o NeuraLink AI",
            "features.subtitle": "Roteamento",
            "features.subtitle2": "Inteligente de IA",
            "features.description": "Analisamos sua solicitação e selecionamos automaticamente o melhor modelo de IA para a tarefa",
            "feature1.title": "Programação",
            "feature1.desc": "Encaminhado automaticamente para Claude, DeepSeek ou Copilot com base na complexidade do código",
            "feature2.title": "Geração de Imagens",
            "feature2.desc": "Gemini para imagens realistas, NanoBanana para estilos criativos e artísticos",
            "feature3.title": "Multi-idioma",
            "feature3.desc": "Suporte completo em 5 idiomas. Converse em seu idioma nativo perfeitamente",
            "feature4.title": "Memória de Contexto",
            "feature4.desc": "Mantém o contexto da conversa em diferentes modelos de IA e sessões",
            
            // How it Works
            "how.title": "Como o",
            "how.title2": "NeuraLink AI",
            "how.title3": "Funciona",
            "how.subtitle": "Três passos simples para turbinar sua produtividade",
            "step1.title": "Digite sua Solicitação",
            "step1.desc": "Simplesmente digite o que você precisa - código, imagens, explicações ou ideias criativas",
            "step2.title": "Seleção de Modelo de IA",
            "step2.desc": "Nosso sistema analisa sua solicitação e escolhe o modelo de IA perfeito automaticamente",
            "step3.title": "Obtenha Resultados Perfeitos",
            "step3.desc": "Receba respostas otimizadas da melhor IA para sua tarefa específica",
            
            // CTA
            "cta.title": "Pronto para Experimentar IA Unificada?",
            "cta.subtitle": "Junte-se a milhares de desenvolvedores e criativos usando o NeuraLink AI",
            "cta.launch": "Lançar NeuraLink AI",
            "cta.note": "Seguro & Privado • Sem cartão de crédito necessário",
            
            // Footer
            "footer.tagline": "Uma plataforma. Toda IA. Possibilidades infinitas.",
            "footer.product": "Produto",
            "footer.resources": "Recursos",
            "footer.legal": "Legal",
            "footer.built": "Construído com Firebase & Magia de IA",
            "footer.copyright": "© 2024 NeuraLink AI. Todos os direitos reservados.",
            
            // Chat
            "chat.back": "Voltar para Início",
            "chat.subtitle": "Chat de Inteligência Unificada",
            "chat.welcome.title": "Bem-vindo ao NeuraLink AI",
            "chat.welcome.subtitle": "Seu assistente unificado para programação e geração de imagens",
            "chat.welcome.code": "Geração de Código",
            "chat.welcome.codeModels": "Claude, DeepSeek & Copilot",
            "chat.welcome.image": "Criação de Imagens",
            "chat.welcome.imageModels": "Gemini & NanoBanana",
            "chat.welcome.language": "Multi-idioma",
            "chat.welcome.languageSupport": "5 idiomas suportados",
            "chat.welcome.try": "Tente perguntar:",
            "chat.welcome.example1": "\"Crie um componente React para login\"",
            "chat.welcome.example2": "\"Gere uma paisagem urbana futurista\"",
            "chat.welcome.example3": "\"Explique async/await em JavaScript\"",
            "chat.welcome.example4": "\"Depure esta função Python\"",
            
            // Chat Input
            "chat.input.placeholder": "Digite sua mensagem aqui... (Pressione Enter para enviar, Shift+Enter para nova linha)",
            "chat.input.send": "Enviar",
            "chat.input.attachments": "Anexos",
            "chat.input.clear": "Limpar",
            "chat.input.export": "Exportar",
            "chat.input.guest": "Modo Convidado",
            "chat.input.code": "Código",
            "chat.input.image": "Imagem",
            "chat.input.debug": "Depurar",
            "chat.input.explain": "Explicar",
            "chat.input.translate": "Traduzir",
            
            // Model Selector
            "model.auto": "Seleção automática",
            "model.auto.desc": "Roteamento inteligente",
            "model.claude": "Claude",
            "model.claude.desc": "Raciocínio avançado",
            "model.deepseek": "DeepSeek",
            "model.deepseek.desc": "Otimização de código",
            "model.copilot": "GitHub Copilot",
            "model.copilot.desc": "Geração de código",
            "model.gemini": "Gemini",
            "model.gemini.desc": "Imagens realistas",
            "model.nanobanana": "NanoBanana",
            "model.nanobanana.desc": "Criativo & artístico",
            
            // Settings
            "settings.title": "Configurações",
            "settings.ai": "Preferências de IA",
            "settings.defaultModel": "Modelo de IA padrão",
            "settings.responseSpeed": "Velocidade de resposta",
            "settings.fast": "Rápido",
            "settings.balanced": "Equilibrado",
            "settings.quality": "Qualidade",
            "settings.personalization": "Personalização",
            "settings.interfaceLang": "Idioma da interface",
            "settings.theme": "Tema",
            "settings.dark": "Escuro",
            "settings.light": "Claro",
            "settings.auto": "Automático",
            "settings.privacy": "Privacidade",
            "settings.saveHistory": "Salvar histórico de chat",
            "settings.improvement": "Dados de melhoria",
            "settings.improvementDesc": "Ajude a melhorar o NeuraLink AI compartilhando dados de uso anônimos",
            "settings.save": "Salvar Configurações",
            "settings.reset": "Redefinir",
            
            // History
            "history.title": "Histórico de Chat",
            "history.search": "Buscar chats...",
            "history.all": "Todos",
            "history.code": "Código",
            "history.image": "Imagens",
            "history.saved": "Salvos",
            "history.empty": "Nenhum histórico de chat ainda",
            "history.emptyDesc": "Comece uma conversa para ver seu histórico aqui",
            "history.clear": "Limpar Tudo",
            "history.storage": "1,2 GB / 5 GB",
            
            // Status
            "status.ready": "NeuraLink AI está pronto",
            
            // Notifications
            "notification.success": "Sucesso",
            "notification.error": "Erro",
            "notification.warning": "Aviso",
            "notification.info": "Informação"
        };
    }

    getSpanishTranslations() {
        return {
            // Navigation
            "nav.features": "Características",
            "nav.pricing": "Precios",
            "nav.launch": "Abrir Chat",
            "nav.home": "Inicio",
            "nav.how": "Cómo Funciona",
            
            // Hero Section
            "hero.badge": "Todos los Modelos de IA Unificados",
            "hero.title1": "Una Plataforma.",
            "hero.title2": "Toda IA.",
            "hero.subtitle": "Claude, DeepSeek, GitHub Copilot, Gemini & NanoBanana",
            "hero.highlight": "unificados en un asistente inteligente",
            "hero.description": "Desde la generación de código hasta la creación de imágenes, NeuraLink AI enruta inteligentemente tus solicitudes al modelo de IA perfecto. Sin cambiar entre herramientas. Sin pérdida de contexto. Solo productividad pura.",
            "hero.startChat": "Iniciar Chat Ahora",
            "hero.watchDemo": "Ver Demostración",
            "hero.stats.ai": "Modelos de IA",
            "hero.stats.languages": "Idiomas",
            "hero.stats.possibilities": "Posibilidades",
            
            // Features
            "features.title": "Por qué Elegir NeuraLink AI",
            "features.subtitle": "Enrutamiento",
            "features.subtitle2": "Inteligente de IA",
            "features.description": "Analizamos tu solicitud y seleccionamos automáticamente el mejor modelo de IA para la tarea",
            "feature1.title": "Programación",
            "feature1.desc": "Enrutado automáticamente a Claude, DeepSeek o Copilot según la complejidad del código",
            "feature2.title": "Generación de Imágenes",
            "feature2.desc": "Gemini para imágenes realistas, NanoBanana para estilos creativos y artísticos",
            "feature3.title": "Multilingüe",
            "feature3.desc": "Soporte completo en 5 idiomas. Chatea en tu idioma nativo sin problemas",
            "feature4.title": "Memoria de Contexto",
            "feature4.desc": "Mantiene el contexto de la conversación en diferentes modelos de IA y sesiones",
            
            // How it Works
            "how.title": "Cómo",
            "how.title2": "NeuraLink AI",
            "how.title3": "Funciona",
            "how.subtitle": "Tres pasos simples para potenciar tu productividad",
            "step1.title": "Escribe tu Solicitud",
            "step1.desc": "Simplemente escribe lo que necesitas - código, imágenes, explicaciones o ideas creativas",
            "step2.title": "Selección de Modelo de IA",
            "step2.desc": "Nuestro sistema analiza tu solicitud y elige el modelo de IA perfecto automáticamente",
            "step3.title": "Obtén Resultados Perfectos",
            "step3.desc": "Recibe respuestas optimizadas de la mejor IA para tu tarea específica",
            
            // CTA
            "cta.title": "¿Listo para Experimentar IA Unificada?",
            "cta.subtitle": "Únete a miles de desarrolladores y creativos usando NeuraLink AI",
            "cta.launch": "Lanzar NeuraLink AI",
            "cta.note": "Seguro & Privado • Sin tarjeta de crédito necesaria",
            
            // Footer
            "footer.tagline": "Una plataforma. Toda IA. Posibilidades infinitas.",
            "footer.product": "Producto",
            "footer.resources": "Recursos",
            "footer.legal": "Legal",
            "footer.built": "Construido con Firebase & Magia de IA",
            "footer.copyright": "© 2024 NeuraLink AI. Todos los derechos reservados.",
            
            // Chat
            "chat.back": "Volver al Inicio",
            "chat.subtitle": "Chat de Inteligencia Unificada",
            "chat.welcome.title": "Bienvenido a NeuraLink AI",
            "chat.welcome.subtitle": "Tu asistente unificado para programación y generación de imágenes",
            "chat.welcome.code": "Generación de Código",
            "chat.welcome.codeModels": "Claude, DeepSeek & Copilot",
            "chat.welcome.image": "Creación de Imágenes",
            "chat.welcome.imageModels": "Gemini & NanoBanana",
            "chat.welcome.language": "Multilingüe",
            "chat.welcome.languageSupport": "5 idiomas soportados",
            "chat.welcome.try": "Intenta preguntar:",
            "chat.welcome.example1": "\"Crea un componente React para inicio de sesión\"",
            "chat.welcome.example2": "\"Genera un paisaje urbano futurista\"",
            "chat.welcome.example3": "\"Explica async/await en JavaScript\"",
            "chat.welcome.example4": "\"Depura esta función de Python\"",
            
            // Chat Input
            "chat.input.placeholder": "Escribe tu mensaje aquí... (Presiona Enter para enviar, Shift+Enter para nueva línea)",
            "chat.input.send": "Enviar",
            "chat.input.attachments": "Adjuntos",
            "chat.input.clear": "Limpiar",
            "chat.input.export": "Exportar",
            "chat.input.guest": "Modo Invitado",
            "chat.input.code": "Código",
            "chat.input.image": "Imagen",
            "chat.input.debug": "Depurar",
            "chat.input.explain": "Explicar",
            "chat.input.translate": "Traducir",
            
            // Model Selector
            "model.auto": "Selección automática",
            "model.auto.desc": "Enrutamiento inteligente",
            "model.claude": "Claude",
            "model.claude.desc": "Razonamiento avanzado",
            "model.deepseek": "DeepSeek",
            "model.deepseek.desc": "Optimización de código",
            "model.copilot": "GitHub Copilot",
            "model.copilot.desc": "Generación de código",
            "model.gemini": "Gemini",
            "model.gemini.desc": "Imágenes realistas",
            "model.nanobanana": "NanoBanana",
            "model.nanobanana.desc": "Creativo & artístico",
            
            // Settings
            "settings.title": "Configuración",
            "settings.ai": "Preferencias de IA",
            "settings.defaultModel": "Modelo de IA predeterminado",
            "settings.responseSpeed": "Velocidad de respuesta",
            "settings.fast": "Rápido",
            "settings.balanced": "Equilibrado",
            "settings.quality": "Calidad",
            "settings.personalization": "Personalización",
            "settings.interfaceLang": "Idioma de la interfaz",
            "settings.theme": "Tema",
            "settings.dark": "Oscuro",
            "settings.light": "Claro",
            "settings.auto": "Automático",
            "settings.privacy": "Privacidad",
            "settings.saveHistory": "Guardar historial de chat",
            "settings.improvement": "Datos de mejora",
            "settings.improvementDesc": "Ayuda a mejorar NeuraLink AI compartiendo datos de uso anónimos",
            "settings.save": "Guardar Configuración",
            "settings.reset": "Reiniciar",
            
            // History
            "history.title": "Historial de Chat",
            "history.search": "Buscar chats...",
            "history.all": "Todos",
            "history.code": "Código",
            "history.image": "Imágenes",
            "history.saved": "Guardados",
            "history.empty": "Aún no hay historial de chat",
            "history.emptyDesc": "Comienza una conversación para ver tu historial aquí",
            "history.clear": "Limpiar Todo",
            "history.storage": "1,2 GB / 5 GB",
            
            // Status
            "status.ready": "NeuraLink AI está listo",
            
            // Notifications
            "notification.success": "Éxito",
            "notification.error": "Error",
            "notification.warning": "Advertencia",
            "notification.info": "Información"
        };
    }

    getFrenchTranslations() {
        return {
            // Navigation
            "nav.features": "Fonctionnalités",
            "nav.pricing": "Tarifs",
            "nav.launch": "Ouvrir le Chat",
            "nav.home": "Accueil",
            "nav.how": "Comment ça Marche",
            
            // Hero Section
            "hero.badge": "Tous les Modèles d'IA Unifiés",
            "hero.title1": "Une Plateforme.",
            "hero.title2": "Toute IA.",
            "hero.subtitle": "Claude, DeepSeek, GitHub Copilot, Gemini & NanoBanana",
            "hero.highlight": "unifiés dans un assistant intelligent",
            "hero.description": "De la génération de code à la création d'images, NeuraLink AI route intelligemment vos demandes vers le modèle d'IA parfait. Pas de changement d'outils. Pas de perte de contexte. Juste une productivité pure.",
            "hero.startChat": "Commencer le Chat Maintenant",
            "hero.watchDemo": "Voir la Démo",
            "hero.stats.ai": "Modèles d'IA",
            "hero.stats.languages": "Langues",
            "hero.stats.possibilities": "Possibilités",
            
            // Features
            "features.title": "Pourquoi Choisir NeuraLink AI",
            "features.subtitle": "Routage",
            "features.subtitle2": "Intelligent d'IA",
            "features.description": "Nous analysons votre demande et sélectionnons automatiquement le meilleur modèle d'IA pour la tâche",
            "feature1.title": "Programmation",
            "feature1.desc": "Routé automatiquement vers Claude, DeepSeek ou Copilot selon la complexité du code",
            "feature2.title": "Génération d'Images",
            "feature2.desc": "Gemini pour des images réalistes, NanoBanana pour des styles créatifs et artistiques",
            "feature3.title": "Multilingue",
            "feature3.desc": "Support complet en 5 langues. Discutez dans votre langue maternelle sans problème",
            "feature4.title": "Mémoire de Contexte",
            "feature4.desc": "Maintient le contexte de la conversation entre différents modèles d'IA et sessions",
            
            // How it Works
            "how.title": "Comment",
            "how.title2": "NeuraLink AI",
            "how.title3": "Fonctionne",
            "how.subtitle": "Trois étapes simples pour booster votre productivité",
            "step1.title": "Tapez votre Demande",
            "step1.desc": "Tapez simplement ce dont vous avez besoin - code, images, explications ou idées créatives",
            "step2.title": "Sélection du Modèle d'IA",
            "step2.desc": "Notre système analyse votre demande et choisit le modèle d'IA parfait automatiquement",
            "step3.title": "Obtenez des Résultats Parfaits",
            "step3.desc": "Recevez des réponses optimisées de la meilleure IA pour votre tâche spécifique",
            
            // CTA
            "cta.title": "Prêt à Expérimenter l'IA Unifiée ?",
            "cta.subtitle": "Rejoignez des milliers de développeurs et créatifs utilisant NeuraLink AI",
            "cta.launch": "Lancer NeuraLink AI",
            "cta.note": "Sécurisé & Privé • Aucune carte de crédit requise",
            
            // Footer
            "footer.tagline": "Une plateforme. Toute IA. Possibilités infinies.",
            "footer.product": "Produit",
            "footer.resources": "Ressources",
            "footer.legal": "Légal",
            "footer.built": "Construit avec Firebase & Magie d'IA",
            "footer.copyright": "© 2024 NeuraLink AI. Tous droits réservés.",
            
            // Chat
            "chat.back": "Retour à l'Accueil",
            "chat.subtitle": "Chat d'Intelligence Unifiée",
            "chat.welcome.title": "Bienvenue sur NeuraLink AI",
            "chat.welcome.subtitle": "Votre assistant unifié pour la programmation et la génération d'images",
            "chat.welcome.code": "Génération de Code",
            "chat.welcome.codeModels": "Claude, DeepSeek & Copilot",
            "chat.welcome.image": "Création d'Images",
            "chat.welcome.imageModels": "Gemini & NanoBanana",
            "chat.welcome.language": "Multilingue",
            "chat.welcome.languageSupport": "5 langues supportées",
            "chat.welcome.try": "Essayez de demander :",
            "chat.welcome.example1": "\"Créez un composant React pour une connexion\"",
            "chat.welcome.example2": "\"Générez un paysage urbain futuriste\"",
            "chat.welcome.example3": "\"Expliquez async/await en JavaScript\"",
            "chat.welcome.example4": "\"Déboguez cette fonction Python\"",
            
            // Chat Input
            "chat.input.placeholder": "Tapez votre message ici... (Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne)",
            "chat.input.send": "Envoyer",
            "chat.input.attachments": "Pièces jointes",
            "chat.input.clear": "Effacer",
            "chat.input.export": "Exporter",
            "chat.input.guest": "Mode Invité",
            "chat.input.code": "Code",
            "chat.input.image": "Image",
            "chat.input.debug": "Déboguer",
            "chat.input.explain": "Expliquer",
            "chat.input.translate": "Traduire",
            
            // Model Selector
            "model.auto": "Sélection automatique",
            "model.auto.desc": "Routage intelligent",
            "model.claude": "Claude",
            "model.claude.desc": "Raisonnement avancé",
            "model.deepseek": "DeepSeek",
            "model.deepseek.desc": "Optimisation de code",
            "model.copilot": "GitHub Copilot",
            "model.copilot.desc": "Génération de code",
            "model.gemini": "Gemini",
            "model.gemini.desc": "Images réalistes",
            "model.nanobanana": "NanoBanana",
            "model.nanobanana.desc": "Créatif & artistique",
            
            // Settings
            "settings.title": "Paramètres",
            "settings.ai": "Préférences d'IA",
            "settings.defaultModel": "Modèle d'IA par défaut",
            "settings.responseSpeed": "Vitesse de réponse",
            "settings.fast": "Rapide",
            "settings.balanced": "Équilibré",
            "settings.quality": "Qualité",
            "settings.personalization": "Personnalisation",
            "settings.interfaceLang": "Langue de l'interface",
            "settings.theme": "Thème",
            "settings.dark": "Sombre",
            "settings.light": "Clair",
            "settings.auto": "Automatique",
            "settings.privacy": "Confidentialité",
            "settings.saveHistory": "Sauvegarder l'historique du chat",
            "settings.improvement": "Données d'amélioration",
            "settings.improvementDesc": "Aidez à améliorer NeuraLink AI en partageant des données d'utilisation anonymes",
            "settings.save": "Enregistrer les Paramètres",
            "settings.reset": "Réinitialiser",
            
            // History
            "history.title": "Historique du Chat",
            "history.search": "Rechercher des chats...",
            "history.all": "Tous",
            "history.code": "Code",
            "history.image": "Images",
            "history.saved": "Sauvegardés",
            "history.empty": "Aucun historique de chat pour l'instant",
            "history.emptyDesc": "Commencez une conversation pour voir votre historique ici",
            "history.clear": "Tout Effacer",
            "history.storage": "1,2 Go / 5 Go",
            
            // Status
            "status.ready": "NeuraLink AI est prêt",
            
            // Notifications
            "notification.success": "Succès",
            "notification.error": "Erreur",
            "notification.warning": "Avertissement",
            "notification.info": "Information"
        };
    }

    getGermanTranslations() {
        return {
            // Navigation
            "nav.features": "Funktionen",
            "nav.pricing": "Preise",
            "nav.launch": "Chat Öffnen",
            "nav.home": "Startseite",
            "nav.how": "So Funktioniert's",
            
            // Hero Section
            "hero.badge": "Alle KI-Modelle Vereint",
            "hero.title1": "Eine Plattform.",
            "hero.title2": "Jede KI.",
            "hero.subtitle": "Claude, DeepSeek, GitHub Copilot, Gemini & NanoBanana",
            "hero.highlight": "vereint in einem intelligenten Assistenten",
            "hero.description": "Von Code-Generierung bis Bild-Erstellung - NeuraLink AI leitet Ihre Anfragen intelligent zum perfekten KI-Modell. Kein Wechsel zwischen Tools. Kein Kontextverlust. Nur reine Produktivität.",
            "hero.startChat": "Chat Jetzt Starten",
            "hero.watchDemo": "Demo Ansehen",
            "hero.stats.ai": "KI-Modelle",
            "hero.stats.languages": "Sprachen",
            "hero.stats.possibilities": "Möglichkeiten",
            
            // Features
            "features.title": "Warum NeuraLink AI Wählen",
            "features.subtitle": "Intelligentes",
            "features.subtitle2": "KI-Routing",
            "features.description": "Wir analysieren Ihre Anfrage und wählen automatisch das beste KI-Modell für die Aufgabe",
            "feature1.title": "Programmierung",
            "feature1.desc": "Automatisch an Claude, DeepSeek oder Copilot weitergeleitet basierend auf Code-Komplexität",
            "feature2.title": "Bildgenerierung",
            "feature2.desc": "Gemini für realistische Bilder, NanoBanana für kreative und künstlerische Stile",
            "feature3.title": "Mehrsprachig",
            "feature3.desc": "Vollständige Unterstützung in 5 Sprachen. Chatten Sie nahtlos in Ihrer Muttersprache",
            "feature4.title": "Kontextgedächtnis",
            "feature4.desc": "Behält den Gesprächskontext über verschiedene KI-Modelle und Sitzungen hinweg bei",
            
            // How it Works
            "how.title": "Wie",
            "how.title2": "NeuraLink AI",
            "how.title3": "Funktioniert",
            "how.subtitle": "Drei einfache Schritte, um Ihre Produktivität zu steigern",
            "step1.title": "Geben Sie Ihre Anfrage Ein",
            "step1.desc": "Geben Sie einfach ein, was Sie brauchen - Code, Bilder, Erklärungen oder kreative Ideen",
            "step2.title": "KI-Modell-Auswahl",
            "step2.desc": "Unser System analysiert Ihre Anfrage und wählt automatisch das perfekte KI-Modell",
            "step3.title": "Erhalten Sie Perfekte Ergebnisse",
            "step3.desc": "Erhalten Sie optimierte Antworten von der besten KI für Ihre spezifische Aufgabe",
            
            // CTA
            "cta.title": "Bereit für Vereinte KI?",
            "cta.subtitle": "Treten Sie Tausenden von Entwicklern und Kreativen bei, die NeuraLink AI nutzen",
            "cta.launch": "NeuraLink AI Starten",
            "cta.note": "Sicher & Privat • Keine Kreditkarte erforderlich",
            
            // Footer
            "footer.tagline": "Eine Plattform. Jede KI. Unendliche Möglichkeiten.",
            "footer.product": "Produkt",
            "footer.resources": "Ressourcen",
            "footer.legal": "Rechtliches",
            "footer.built": "Erbaut mit Firebase & KI-Magie",
            "footer.copyright": "© 2024 NeuraLink AI. Alle Rechte vorbehalten.",
            
            // Chat
            "chat.back": "Zurück zur Startseite",
            "chat.subtitle": "Vereinter Intelligenz-Chat",
            "chat.welcome.title": "Willkommen bei NeuraLink AI",
            "chat.welcome.subtitle": "Ihr vereinter Assistent für Programmierung und Bildgenerierung",
            "chat.welcome.code": "Code-Generierung",
            "chat.welcome.codeModels": "Claude, DeepSeek & Copilot",
            "chat.welcome.image": "Bild-Erstellung",
            "chat.welcome.imageModels": "Gemini & NanoBanana",
            "chat.welcome.language": "Mehrsprachig",
            "chat.welcome.languageSupport": "5 Sprachen unterstützt",
            "chat.welcome.try": "Versuchen Sie zu fragen:",
            "chat.welcome.example1": "\"Erstellen Sie eine React-Login-Komponente\"",
            "chat.welcome.example2": "\"Generieren Sie eine futuristische Stadtlandschaft\"",
            "chat.welcome.example3": "\"Erklären Sie async/await in JavaScript\"",
            "chat.welcome.example4": "\"Debuggen Sie diese Python-Funktion\"",
            
            // Chat Input
            "chat.input.placeholder": "Geben Sie Ihre Nachricht hier ein... (Enter zum Senden, Shift+Enter für neue Zeile)",
            "chat.input.send": "Senden",
            "chat.input.attachments": "Anhänge",
            "chat.input.clear": "Löschen",
            "chat.input.export": "Exportieren",
            "chat.input.guest": "Gastmodus",
            "chat.input.code": "Code",
            "chat.input.image": "Bild",
            "chat.input.debug": "Debuggen",
            "chat.input.explain": "Erklären",
            "chat.input.translate": "Übersetzen",
            
            // Model Selector
            "model.auto": "Automatische Auswahl",
            "model.auto.desc": "Intelligentes Routing",
            "model.claude": "Claude",
            "model.claude.desc": "Fortgeschrittenes Denken",
            "model.deepseek": "DeepSeek",
            "model.deepseek.desc": "Code-Optimierung",
            "model.copilot": "GitHub Copilot",
            "model.copilot.desc": "Code-Generierung",
            "model.gemini": "Gemini",
            "model.gemini.desc": "Realistische Bilder",
            "model.nanobanana": "NanoBanana",
            "model.nanobanana.desc": "Kreativ & künstlerisch",
            
            // Settings
            "settings.title": "Einstellungen",
            "settings.ai": "KI-Einstellungen",
            "settings.defaultModel": "Standard-KI-Modell",
            "settings.responseSpeed": "Antwortgeschwindigkeit",
            "settings.fast": "Schnell",
            "settings.balanced": "Ausgeglichen",
            "settings.quality": "Qualität",
            "settings.personalization": "Personalisierung",
            "settings.interfaceLang": "Oberflächensprache",
            "settings.theme": "Thema",
            "settings.dark": "Dunkel",
            "settings.light": "Hell",
            "settings.auto": "Automatisch",
            "settings.privacy": "Datenschutz",
            "settings.saveHistory": "Chat-Verlauf speichern",
            "settings.improvement": "Verbesserungsdaten",
            "settings.improvementDesc": "Helfen Sie NeuraLink AI zu verbessern, indem Sie anonyme Nutzungsdaten teilen",
            "settings.save": "Einstellungen Speichern",
            "settings.reset": "Zurücksetzen",
            
            // History
            "history.title": "Chat-Verlauf",
            "history.search": "Chats suchen...",
            "history.all": "Alle",
            "history.code": "Code",
            "history.image": "Bilder",
            "history.saved": "Gespeichert",
            "history.empty": "Noch kein Chat-Verlauf",
            "history.emptyDesc": "Beginnen Sie eine Konversation, um Ihren Verlauf hier zu sehen",
            "history.clear": "Alles Löschen",
            "history.storage": "1,2 GB / 5 GB",
            
            // Status
            "status.ready": "NeuraLink AI ist bereit",
            
            // Notifications
            "notification.success": "Erfolg",
            "notification.error": "Fehler",
            "notification.warning": "Warnung",
            "notification.info": "Information"
        };
    }

    applyLanguage() {
        // Apply translations to all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translations[this.currentLang]?.[key] || key;
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update language selectors
        this.updateLanguageSelectors();

        // Save language preference
        localStorage.setItem('neuralink_language', this.currentLang);

        // Notify all callbacks
        this.langChangeCallbacks.forEach(callback => callback(this.currentLang));

        console.log(`Language changed to: ${this.currentLang}`);
    }

    setupLanguageSelectors() {
        // Desktop language selector
        const langToggle = document.getElementById('language-toggle');
        const langDropdown = document.getElementById('language-dropdown');
        
        if (langToggle && langDropdown) {
            langToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                langDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                langDropdown.classList.remove('show');
            });

            // Handle language option clicks
            langDropdown.querySelectorAll('.language-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lang = option.dataset.lang;
                    this.setLanguage(lang);
                    langDropdown.classList.remove('show');
                });
            });
        }

        // Mobile language selector
        document.querySelectorAll('.mobile-lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.dataset.lang;
                this.setLanguage(lang);
                
                // Update mobile menu active state
                document.querySelectorAll('.mobile-lang-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
            });
        });

        // Chat language selector
        const chatLangToggle = document.getElementById('chat-language-toggle');
        const chatLangDropdown = document.getElementById('chat-language-dropdown');
        
        if (chatLangToggle && chatLangDropdown) {
            chatLangToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                chatLangDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                chatLangDropdown.classList.remove('show');
            });

            // Handle language option clicks
            chatLangDropdown.querySelectorAll('.language-option-chat').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lang = option.dataset.lang;
                    this.setLanguage(lang);
                    chatLangDropdown.classList.remove('show');
                });
            });
        }

        // Interface language selector in settings
        const interfaceLangSelect = document.getElementById('interface-language');
        if (interfaceLangSelect) {
            interfaceLangSelect.value = this.currentLang;
            interfaceLangSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    updateLanguageSelectors() {
        // Update desktop language selector
        const langBtn = document.getElementById('language-toggle');
        if (langBtn) {
            const flagClass = this.getFlagClass(this.currentLang);
            const langName = this.getLanguageName(this.currentLang);
            
            langBtn.innerHTML = `
                <span class="${flagClass}"></span>
                <span>${langName}</span>
                <i class="fas fa-chevron-down"></i>
            `;
        }

        // Update mobile language selector active state
        document.querySelectorAll('.mobile-lang-option').forEach(option => {
            if (option.dataset.lang === this.currentLang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Update chat language selector
        const chatLangBtn = document.getElementById('chat-language-toggle');
        if (chatLangBtn) {
            const flagClass = this.getFlagClass(this.currentLang);
            chatLangBtn.innerHTML = `
                <span class="${flagClass}"></span>
                <i class="fas fa-chevron-down"></i>
            `;
        }

        // Update active state in dropdowns
        document.querySelectorAll('.language-option').forEach(option => {
            const checkIcon = option.querySelector('.fa-check');
            if (checkIcon) {
                if (option.dataset.lang === this.currentLang) {
                    checkIcon.style.opacity = '1';
                } else {
                    checkIcon.style.opacity = '0';
                }
            }
        });
    }

    getFlagClass(lang) {
        const flags = {
            'en': 'fi fi-us',
            'pt': 'fi fi-br',
            'es': 'fi fi-es',
            'fr': 'fi fi-fr',
            'de': 'fi fi-de'
        };
        return flags[lang] || 'fi fi-us';
    }

    getLanguageName(lang) {
        const names = {
            'en': 'EN',
            'pt': 'PT',
            'es': 'ES',
            'fr': 'FR',
            'de': 'DE'
        };
        return names[lang] || 'EN';
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.applyLanguage();
            return true;
        }
        return false;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    translate(key) {
        return this.translations[this.currentLang]?.[key] || key;
    }

    addLanguageChangeCallback(callback) {
        this.langChangeCallbacks.push(callback);
    }

    removeLanguageChangeCallback(callback) {
        const index = this.langChangeCallbacks.indexOf(callback);
        if (index > -1) {
            this.langChangeCallbacks.splice(index, 1);
        }
    }

    // Utility function to apply translations to dynamic content
    translateElement(element, key) {
        const translation = this.translations[this.currentLang]?.[key] || key;
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    }

    // Initialize i18n attributes on page load
    initializePage() {
        // Add data-i18n attributes to all translatable elements
        this.addI18nAttributes();
        // Apply translations
        this.applyLanguage();
    }

    addI18nAttributes() {
        // This function would add data-i18n attributes to elements
        // For now, we'll rely on manual markup
        // In a production app, you would auto-generate these
    }
}

// Create global instance
const languageManager = new LanguageManager();

// Make available globally
window.languageManager = languageManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    languageManager.initializePage();
});
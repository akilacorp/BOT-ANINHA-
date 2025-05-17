
const axios = require('axios');
const fs = require('fs');
const path = require('path');


function loadConfig() {
    try {
        const configPath = path.join(__dirname, '..', 'config', 'config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
    } catch (err) {
        console.error('❌ Erro ao carregar configuração:', err.message);
        return {};
    }
}

const config = loadConfig();
const openRouterConfig = config.openRouterSettings || {};

class OpenRouterAdapter {
    constructor() {
        this.apiKey = openRouterConfig.apiKey;
        this.apiUrl = openRouterConfig.apiUrl || 'https://openrouter.ai/api/v1/chat/completions';
        this.model = openRouterConfig.model || 'mistralai/mistral-small-3.1-24b-instruct';
        this.initialized = false;
        
        if (!this.apiKey) {
            console.error('❌ API Key do OpenRouter não configurada! Configure em config/config.json');
        } else {
            this.initialized = true;
            console.log(`✅ OpenRouter inicializado com o modelo ${this.model}`);
        }
    }

    /**
     * @param {string} prompt
     * @param {Object} options 
     * @returns {Promise<string>} 
     */
    async generateResponse(prompt, options = {}) {
        if (!this.initialized) {
            throw new Error('OpenRouter não foi inicializado corretamente');
        }

        try {
            const maxTokens = options.maxTokens || 1024;
            const temperature = options.temperature || 0.7;
            const systemPrompt = options.systemPrompt || 'Você é uma assistente útil chamada Aninha.';
            
            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: maxTokens,
                    temperature: temperature,
                    top_p: options.topP || 0.9,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://github.com/whatsapp-bot-aninha',
                        'X-Title': 'Aninha WhatsApp Bot'
                    }
                }
            );
            
            if (response.data.choices && response.data.choices.length > 0) {
                return response.data.choices[0].message.content;
            } else {
                throw new Error('Resposta vazia do OpenRouter');
            }
        } catch (error) {
            console.error('❌ Erro ao gerar resposta:', error.message);
            if (error.response) {
                console.error('Detalhes:', error.response.data);
            }
            throw error;
        }
    }

    async checkStatus() {
        try {
            console.log('🔍 Verificando conexão com OpenRouter...');
            const response = await axios.get('https://openrouter.ai/api/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200 && response.data.data) {
                const models = response.data.data;
                console.log(`✅ Conexão com OpenRouter estabelecida! ${models.length} modelos disponíveis.`);
                

                const ourModel = models.find(m => m.id === this.model);
                if (ourModel) {
                    console.log(`📊 Modelo atual: ${ourModel.id}`);
                    console.log(`📝 Descrição: ${ourModel.description || 'Não disponível'}`);
                    console.log(`💰 Custo: Input: $${ourModel.pricing?.prompt || 'N/A'}/1M tokens, Output: $${ourModel.pricing?.completion || 'N/A'}/1M tokens`);
                }
                
                return true;
            } else {
                console.error('❌ OpenRouter retornou resposta inesperada');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar status do OpenRouter:', error.message);
            if (error.response) {
                console.error('Detalhes:', error.response.data);
            }
            return false;
        }
    }
}

module.exports = OpenRouterAdapter;

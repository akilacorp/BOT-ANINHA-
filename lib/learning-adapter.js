const evolutionaryLearning = require('./evolutionary-learning');
const fs = require('fs');
const path = require('path');

class LearningAdapter {
    constructor() {
        this.initialized = this._initialize();
    }

    async _initialize() {
        try {
            const isReady = evolutionaryLearning.isSystemReady();
            
            if (!isReady) {
                console.error('❌ Sistema de aprendizado evolutivo não está pronto');
                return false;
            }
            
            console.log('✅ Adaptador do sistema evolutivo inicializado');
            
            const dataDir = path.join(__dirname, '../data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Erro ao inicializar adaptador evolutivo: ${error.message}`);
            return false;
        }
    }

    processInteraction(chatId, userMessage, botResponse, sentimentData) {
        try {
            if (!chatId || !userMessage) {
                return { success: false, error: 'Parâmetros inválidos' };
            }
            
            const result = evolutionaryLearning.recordInteraction(
                chatId,
                userMessage,
                botResponse,
                sentimentData
            );
            
            return {
                success: true,
                userProfile: result.userProfile,
                adaptedResponse: result.adaptedResponse || botResponse
            };
        } catch (error) {
            console.error(`❌ Erro ao processar interação evolutiva: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    generatePersonalityInstructions(chatId) {
        try {
            if (!chatId) return '';
            
            return evolutionaryLearning.generatePersonalityInstructions(chatId);
        } catch (error) {
            console.error(`❌ Erro ao gerar instruções evolutivas: ${error.message}`);
            return '';
        }
    }

    getRelevantMemories(chatId, context) {
        try {
            if (!chatId) return [];
            
            return evolutionaryLearning.retrieveRelevantMemories(chatId, context);
        } catch (error) {
            console.error(`❌ Erro ao recuperar memórias: ${error.message}`);
            return [];
        }
    }

    getStatistics() {
        try {
            return evolutionaryLearning.getStatistics();
        } catch (error) {
            console.error(`❌ Erro ao obter estatísticas: ${error.message}`);
            return {};
        }
    }

    isReady() {
        return this.initialized;
    }
}

module.exports = new LearningAdapter();

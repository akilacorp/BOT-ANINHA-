class ConversationHistory {
    constructor(maxMessages = 5, expirationTime = 24 * 60 * 60 * 1000) { 
        this.histories = {};
        this.maxMessages = maxMessages;
        this.expirationTime = expirationTime;
    }

    addMessage(chatId, role, content) {
        if (!this.histories[chatId]) {
            this.histories[chatId] = {
                messages: [],
                lastUpdated: Date.now(),
                userDetails: {
                    topics: new Set(),
                    preferences: new Set(),
                    name: null,
                    mentions: []
                }
            };
        }

        if (role === 'user') {
            this.extractUserDetails(chatId, content);
        }

        this.histories[chatId].messages.push({
            role,
            content,
            timestamp: Date.now()
        });

        this.histories[chatId].lastUpdated = Date.now();

        if (this.histories[chatId].messages.length > this.maxMessages) {
            this.histories[chatId].messages.shift();
        }
    }

    extractUserDetails(chatId, message) {
        const lowercaseMsg = message.toLowerCase();
        
        const namePatterns = [
            /me\s+chamo\s+([a-záàâãéèêíïóôõöúçñ]+)/i,
            /meu\s+nome\s+(?:é|e)\s+([a-záàâãéèêíïóôõöúçñ]+)/i,
            /sou\s+(?:o|a)?\s*([a-záàâãéèêíïóôõöúçñ]+)/i
        ];
        
        for (const pattern of namePatterns) {
            const match = lowercaseMsg.match(pattern);
            if (match && match[1] && match[1].length > 2) {
                this.histories[chatId].userDetails.name = match[1].charAt(0).toUpperCase() + match[1].slice(1);
                break;
            }
        }
        
        const topics = [
            'anime', 'música', 'jogos', 'escola', 'faculdade', 'tiktok', 
            'instagram', 'estudos', 'crush', 'namoro', 'sexo', 'festa'
        ];
        
        topics.forEach(topic => {
            if (lowercaseMsg.includes(topic)) {
                this.histories[chatId].userDetails.topics.add(topic);
            }
        });
        
        const importantInfo = message.match(/\b\d{2}\/\d{2}|\b\d{4}\b|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g);
        if (importantInfo) {
            this.histories[chatId].userDetails.mentions = [
                ...this.histories[chatId].userDetails.mentions,
                ...importantInfo
            ];
        }
    }

    getRecentHistory(chatId) {
        if (!this.histories[chatId]) return [];
        
        if (Date.now() - this.histories[chatId].lastUpdated > this.expirationTime) {
            delete this.histories[chatId];
            return [];
        }
        
        return this.histories[chatId].messages;
    }

    getUserDetails(chatId) {
        if (!this.histories[chatId] || !this.histories[chatId].userDetails) {
            return {};
        }
        
        return {
            name: this.histories[chatId].userDetails.name,
            topics: Array.from(this.histories[chatId].userDetails.topics),
            mentions: this.histories[chatId].userDetails.mentions
        };
    }

    cleanupExpired() {
        const now = Date.now();
        Object.keys(this.histories).forEach(chatId => {
            if (now - this.histories[chatId].lastUpdated > this.expirationTime) {
                delete this.histories[chatId];
            }
        });
    }
}

module.exports = new ConversationHistory();

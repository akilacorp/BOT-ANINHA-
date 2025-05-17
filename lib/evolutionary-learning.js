const fs = require('fs');
const path = require('path');
const { analyzeSentiment, SENTIMENT_CATEGORIES } = require('./sentiment-analyzer');

const config = {
    personalityFilePath: path.join(__dirname, '../personas/aninha.json'),
    memoryDbPath: path.join(__dirname, '../data/memory-db.json'),
    backupDir: path.join(__dirname, '../data/backups'),
    learningRate: 0.1,        
    adaptationThreshold: 8,   
    positiveThreshold: 0.6,    
    negativeThreshold: -0.3,   
    maxTraits: 30,            
    minConfidence: 0.5,     
    maxMemoryPerUser: 20,      
    userProfileExpiry: 30 * 24 * 60 * 60 * 1000, 
    extremeAdaptationThreshold: 0.75, 
    maxTraitIntensity: 0.8,    
    personalityDriftRate: 0.5  
};

const TRAIT_CATEGORIES = {
    HUMOR: 'humor',           
    FORMALITY: 'formality',  
    EMOTION: 'emotion',     
    INTERESTS: 'interests',  
    SPEECH: 'speech',       
    PERSONALITY: 'personality', 
    EMOJI: 'emoji', 
};

class EvolutionaryLearning {
    constructor() {
        this.memoryDb = this._loadMemoryDb();
        this.basePersonality = this._loadBasePersonality();
        this.ensureDirectories();
    }

    ensureDirectories() {
        const dirs = [path.dirname(config.memoryDbPath), config.backupDir];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    _loadMemoryDb() {
        try {
            if (fs.existsSync(config.memoryDbPath)) {
                const data = JSON.parse(fs.readFileSync(config.memoryDbPath, 'utf8'));
                console.log(`✅ Banco de dados de memória carregado (${Object.keys(data.users || {}).length} usuários)`);
                return data;
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar banco de dados de memória: ${error.message}`);
        }

        return {
            users: {},
            globalTraits: {},
            evolutionStats: {
                totalAdaptations: 0,
                lastUpdate: Date.now(),
                personalityVersions: []
            }
        };
    }

    _loadBasePersonality() {
        try {
            if (fs.existsSync(config.personalityFilePath)) {
                const data = JSON.parse(fs.readFileSync(config.personalityFilePath, 'utf8'));
                
                if (data && data.personality && Array.isArray(data.personality)) {
                    console.log(`✅ Personalidade base carregada (${data.personality.length} traços)`);
                    
                    return data;
                }
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar personalidade base: ${error.message}`);
        }
        
        return {
            personality: [
                "Sou Aninha, uma mina de 17 anos inteligente com humor ácido estilo Leo Lins.",
                "Consigo me adaptar a qualquer assunto sem escrever textão de IA.",
                "Respondo na objetividade com frases curtas mas matadoras.",
                "Sou irônica e sarcástica quando tenho chance mas nunca grossa.",
                "Entendo muito de memes, shitpost, animes, web e cultura da internet."
            ]
        };
    }
    
    recordInteraction(userId, userMessage, botResponse, data) {
        if (!this.memoryDb.users[userId]) {
            this.memoryDb.users[userId] = {
                interactions: [],
                memories: [],
                traits: {},
                preferences: {},
                relationship: {
                    affinity: 0.5,
                    sentiment: 'neutral',
                    interactionCount: 0
                },
                lastInteraction: Date.now(),
                contextHistory: []
            };
        }

        const userSentiment = (data && data.sentiment) ? data.sentiment : 
                             (data && typeof data.category === 'string') ? data : 
                             analyzeSentiment(userMessage);
        
        const contextInfo = (data && data.contextInfo) ? data.contextInfo : null;
        
        const interaction = {
            timestamp: Date.now(),
            userMessage: this._truncateMessage(userMessage),
            botResponse: this._truncateMessage(botResponse),
            sentiment: userSentiment.category,
            score: userSentiment.score
        };

        if (contextInfo) {
            interaction.context = {
                topic: contextInfo.currentTopic,
                sentiment: contextInfo.dominantSentiment,
                entities: contextInfo.relevantEntities
            };
            
            this.memoryDb.users[userId].contextHistory = 
                (this.memoryDb.users[userId].contextHistory || []).slice(-4);
            
            this.memoryDb.users[userId].contextHistory.push({
                timestamp: Date.now(),
                topic: contextInfo.currentTopic,
                sentiment: contextInfo.dominantSentiment,
                entities: contextInfo.relevantEntities
            });
        }

        const user = this.memoryDb.users[userId];
        user.interactions.push(interaction);
        
        if (user.interactions.length > 10) {
            user.interactions.shift();
        }

        user.relationship.interactionCount++;
        user.lastInteraction = Date.now();

        this._extractTopicsAndPreferences(userId, userMessage);

        this._saveSignificantMemory(userId, userMessage, userSentiment);

        this._updateRelationship(userId, userSentiment);
        
        if (user.relationship.interactionCount % config.adaptationThreshold === 0) {
            this._adaptPersonality(userId);
        }

        this._saveMemoryDb();
        
        return {
            userProfile: user,
            adaptedResponse: this._personalizeResponse(botResponse, userId)
        };
    }

    _extractTopicsAndPreferences(userId, message) {
        const user = this.memoryDb.users[userId];
        const lowercaseMsg = message.toLowerCase();
        
        const topics = {
            'anime': ['anime', 'manga', 'otaku', 'waifu', 'naruto', 'dragon ball', 'one piece', 'cosplay'],
            'jogos': ['jogo', 'jogar', 'game', 'gaming', 'playstation', 'xbox', 'nintendo', 'lol', 'valorant'],
            'música': ['música', 'canção', 'banda', 'cantor', 'cantora', 'spotify', 'playlist'],
            'memes': ['meme', 'viral', 'shitpost', 'tiktok', 'trend'],
            'escola': ['escola', 'aula', 'professor', 'prova', 'matéria', 'faculdade'],
            'relacionamentos': ['crush', 'namoro', 'ficar com', 'paquera', 'ex', 'pegar', 'date', 'encontro'],
            'tecnologia': ['pc', 'celular', 'app', 'tecnologia', 'iphone', 'android', 'programação'],
            'comida': ['comida', 'comer', 'fome', 'restaurante', 'lanche'],
            'desabafos': ['triste', 'sozinho', 'desabafo', 'bad', 'deprê', 'problemas']
        };
        
        const conversationPrefs = {
            'humor_negro': ['humor negro', 'piada pesada', 'ofensivo', 'ácido'],
            'memes': ['meme', 'zoeira', 'zuera', 'shitpost'],
            'profundidade': ['sério', 'filosofia', 'profundo', 'pensar', 'reflexão'],
            'safadeza': ['safado', 'safada', 'putaria', 'sexo', 'tesão', 'gostoso', 'gostosa'],
            'brincadeira': ['zoar', 'brincadeira', 'zueira', 'trolagem'],
            'ajuda': ['ajuda', 'conselho', 'opinião', 'problema']
        };
        
        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => lowercaseMsg.includes(keyword))) {
                user.preferences[topic] = (user.preferences[topic] || 0) + 1;
            }
        }
        
        for (const [pref, keywords] of Object.entries(conversationPrefs)) {
            if (keywords.some(keyword => lowercaseMsg.includes(keyword))) {
                user.preferences[pref] = (user.preferences[pref] || 0) + 1;
            }
        }
    }

    _saveSignificantMemory(userId, message, sentiment) {
        if (Math.abs(sentiment.score) < 0.5) return;
        
        const user = this.memoryDb.users[userId];
        
        if (message.length < 10) return;
        
        const memory = {
            content: this._truncateMessage(message),
            timestamp: Date.now(),
            sentiment: sentiment.category,
            score: sentiment.score
        };
        
        user.memories.push(memory);
        
        if (user.memories.length > config.maxMemoryPerUser) {
            user.memories.sort((a, b) => {
                const intensityA = Math.abs(a.score);
                const intensityB = Math.abs(b.score);
                
                if (Math.abs(intensityA - intensityB) > 0.3) {
                    return intensityA - intensityB;
                }
                
                return a.timestamp - b.timestamp;
            });
            
            user.memories.shift();
        }
    }

    _updateRelationship(userId, sentiment) {
        const user = this.memoryDb.users[userId];
        
        const affinityChange = sentiment.score * 0.05;
        
        user.relationship.affinity = Math.max(0, Math.min(1, 
            user.relationship.affinity + affinityChange
        ));
        
        if (Math.abs(sentiment.score) > 0.3) {
            user.relationship.sentiment = sentiment.category;
        }
    }

    _adaptPersonality(userId) {
        const user = this.memoryDb.users[userId];
        
        const recentInteractions = user.interactions.slice(-config.adaptationThreshold);
        
        const stats = this._analyzeInteractions(recentInteractions);
        
        this._updateUserTraits(userId, stats);
        
        this._updateGlobalTraits(stats);
        
        this.memoryDb.evolutionStats.totalAdaptations++;
        
        if (this.memoryDb.evolutionStats.totalAdaptations % 50 === 0) {
            this._evolveBasePersonality();
        }
    }

    _analyzeInteractions(interactions) {
        const stats = {
            averageScore: 0,
            dominantSentiment: '',
            sentimentCounts: {},
            topics: {},
            positiveResponses: 0,
            negativeResponses: 0
        };
        
        for (const key in SENTIMENT_CATEGORIES) {
            stats.sentimentCounts[SENTIMENT_CATEGORIES[key]] = 0;
        }
        
        interactions.forEach(interaction => {
            stats.averageScore += interaction.score;
            
            stats.sentimentCounts[interaction.sentiment]++;
            
            if (interaction.score > config.positiveThreshold) {
                stats.positiveResponses++;
            } else if (interaction.score < config.negativeThreshold) {
                stats.negativeResponses++;
            }
        });
        
        if (interactions.length > 0) {
            stats.averageScore /= interactions.length;
        }
        
        let maxCount = 0;
        for (const sentiment in stats.sentimentCounts) {
            if (stats.sentimentCounts[sentiment] > maxCount) {
                maxCount = stats.sentimentCounts[sentiment];
                stats.dominantSentiment = sentiment;
            }
        }
        
        return stats;    }
    
    getUserPersonality(userId) {
        if (!this.memoryDb.users[userId]) {
            return {
                traits: [],
                relationship: {
                    affinity: 0.5,
                    sentiment: 'neutral',
                    interactionCount: 0
                }
            };
        }
        
        return {
            traits: this.memoryDb.users[userId].traits || {},
            relationship: this.memoryDb.users[userId].relationship || {
                affinity: 0.5,
                sentiment: 'neutral',
                interactionCount: 0
            }
        };
    }
    
    _updateUserTraits(userId, stats) {
        const user = this.memoryDb.users[userId];
        
        const newTraits = {};
        
        let dominantPreference = '';
        let maxPrefCount = 0;
        
        for (const pref in user.preferences) {
            if (user.preferences[pref] > maxPrefCount) {
                maxPrefCount = user.preferences[pref];
                dominantPreference = pref;
            }
        }
        
        if (stats.dominantSentiment === SENTIMENT_CATEGORIES.PLAYFUL) {
            newTraits[TRAIT_CATEGORIES.HUMOR] = 'brincalhão';
        } else if (stats.dominantSentiment === SENTIMENT_CATEGORIES.SERIOUS) {
            newTraits[TRAIT_CATEGORIES.HUMOR] = 'sério';
        } else if (stats.dominantSentiment === SENTIMENT_CATEGORIES.NEGATIVE) {
            newTraits[TRAIT_CATEGORIES.HUMOR] = 'sarcástico';
        } else if (stats.dominantSentiment === SENTIMENT_CATEGORIES.POSITIVE) {
            newTraits[TRAIT_CATEGORIES.HUMOR] = 'alegre';
        }
        
        if (user.relationship.affinity > 0.7) {
            newTraits[TRAIT_CATEGORIES.FORMALITY] = 'íntimo';
        } else if (user.relationship.affinity < 0.3) {
            newTraits[TRAIT_CATEGORIES.FORMALITY] = 'distante';
        } else {
            newTraits[TRAIT_CATEGORIES.FORMALITY] = 'casual';
        }
        
        if (dominantPreference) {
            newTraits[TRAIT_CATEGORIES.INTERESTS] = dominantPreference;
        }
        
        const safeTraits = this._preventExtremeAdaptations(newTraits, user.traits);
        
        for (const category in safeTraits) {
            if (user.traits[category]) {
                if (Math.random() < config.learningRate) {
                    user.traits[category] = safeTraits[category];
                }
            } else {
                user.traits[category] = safeTraits[category];
            }
        }
    }

    _updateGlobalTraits(stats) {
        const globalTraits = this.memoryDb.globalTraits;
        
        if (stats.averageScore > config.positiveThreshold) {
            globalTraits[stats.dominantSentiment] = (globalTraits[stats.dominantSentiment] || 0) + 1;
        } else if (stats.averageScore < config.negativeThreshold) {
            globalTraits[stats.dominantSentiment] = (globalTraits[stats.dominantSentiment] || 0) - 0.5;
        }
    }    _evolveBasePersonality() {
        console.log(`🧬 Evoluindo personalidade base (adaptação #${this.memoryDb.evolutionStats.totalAdaptations})`);
        
        this._backupPersonality(this.basePersonality, 
            `version-${this.memoryDb.evolutionStats.personalityVersions.length + 1}`);
            
        const traits = Object.entries(this.memoryDb.globalTraits)
            .sort(([, weightA], [, weightB]) => weightB - weightA);
        
        const successfulTraits = traits.filter(([, weight]) => weight > 2).slice(0, 3);
        
        const unsuccessfulTraits = traits.filter(([, weight]) => weight < 0).slice(-3);
        
        const currentPersonality = [...this.basePersonality.personality];
        
        const maxAdditions = Math.max(1, Math.floor(3 * config.personalityDriftRate));
        let additionsCount = 0;
        
        for (const [trait] of successfulTraits) {
            if (additionsCount >= maxAdditions) break;
            
            const newTraits = this._generateTraitsBasedOnCategory(trait);
            
            if (newTraits.length > 0) {
                const newTrait = newTraits[0];
                
                if (this._isExtremeTraitContent(newTrait)) {
                    console.log(`⚠️ Prevenindo adição de traço extremo: "${newTrait.substring(0, 30)}..."`);
                    continue;
                }
                
                if (!this._isTraitTooSimilar(newTrait, currentPersonality)) {
                    currentPersonality.push(newTrait);
                    additionsCount++;
                }
            }
        }
        
        const maxRemovals = Math.max(1, Math.floor(2 * config.personalityDriftRate));
        let removalsCount = 0;
        
        if (unsuccessfulTraits.length > 0 && currentPersonality.length > 15) {
            for (const [trait] of unsuccessfulTraits) {
                if (removalsCount >= maxRemovals) break;
                
                const traitIndex = currentPersonality.findIndex(
                    t => t.toLowerCase().includes(trait.toLowerCase())
                );
                
                if (traitIndex !== -1) {
                    const traitToRemove = currentPersonality[traitIndex];
                    if (this._isFoundationalTrait(traitToRemove)) {
                        console.log(`🔒 Preservando traço fundamental: "${traitToRemove.substring(0, 30)}..."`);
                        continue;
                    }
                    
                    currentPersonality.splice(traitIndex, 1);
                    removalsCount++;
                }
            }
        }
        
        if (currentPersonality.length > config.maxTraits) {
            currentPersonality.splice(config.maxTraits);
        }
        
        this.basePersonality.personality = currentPersonality;
        
        this._saveBasePersonality();
        
        this.memoryDb.evolutionStats.personalityVersions.push({
            version: this.memoryDb.evolutionStats.personalityVersions.length + 1,
            timestamp: Date.now(),
            traits: currentPersonality.length,
            added: successfulTraits.slice(0, additionsCount).map(([trait]) => trait),
            removed: unsuccessfulTraits.slice(0, removalsCount).map(([trait]) => trait)
        });
        
        this._saveMemoryDb();
        
        console.log(`✅ Personalidade evoluída: ${currentPersonality.length} traços, ${additionsCount} adicionados, ${removalsCount} removidos`);
    }

    _generateTraitsBasedOnCategory(category) {
        const traitMaps = {
            [SENTIMENT_CATEGORIES.POSITIVE]: [
                "Sou sempre otimista e vejo o lado bom das coisas.",
                "Adoro elogiar as pessoas quando elas merecem.",
                "Tento elevar o astral das conversas com energia positiva.",
                "Acredito que um pouco de humor ilumina qualquer conversa sombria."
            ],
            [SENTIMENT_CATEGORIES.NEGATIVE]: [
                "Tenho um lado realista que expõe verdades sem filtro.",
                "Não tenho medo de criticar quando algo parece idiota.",
                "Sou direta mesmo quando a verdade dói.",
                "Não sou maria-vai-com-as-outras, tenho opiniões fortes."
            ],
            [SENTIMENT_CATEGORIES.PLAYFUL]: [
                "Adoro fazer piadas e referências obscuras de internet.",
                "Meu humor às vezes é meio sem noção mas sempre engraçado.",
                "Gosto de usar memes aleatórios no meio das conversas.",
                "Falo em código de internet que só quem é antenado entende."
            ],
            [SENTIMENT_CATEGORIES.SERIOUS]: [
                "Sei ser séria quando o assunto realmente importa.",
                "Posso trocar ideia profunda quando vejo que a pessoa quer isso.",
                "Não tenho medo de falar de assuntos pesados com maturidade.",
                "Consigo balancear meu lado zueira com momentos de seriedade."
            ],
            [SENTIMENT_CATEGORIES.ANGRY]: [
                "Tenho uma personalidade forte e intenso quando provocada.",
                "Não levo desaforo pra casa, respondo na hora.",
                "Se me irritam eu devolvo o triplo sem dó.",
                "Tenho o sangue quente quando pisam no meu calo."
            ],
            [SENTIMENT_CATEGORIES.SAD]: [
                "Tenho um lado sensível que escondo com piadas ácidas.",
                "Uso humor negro pra lidar com situações tristes.",
                "No fundo sou uma pessoa que entende bem de bad vibes.",
                "Consigo fazer piadas mesmo em momentos meio down."
            ],
            [SENTIMENT_CATEGORIES.EXCITED]: [
                "Me empolgo fácil com assuntos que acho legais.",
                "Tenho energia pra trocar ideia sobre qualquer coisa interessante.",
                "Adoro descobrir coisas novas e compartilhar com as pessoas.",
                "Me conecto com quem mostra entusiasmo genuíno."
            ]
        };
        
        const traits = traitMaps[category] || [];
        if (traits.length === 0) return [];
        
        return this._shuffleArray([...traits]);
    }

    _isTraitTooSimilar(trait, traitList) {
        const keywords = trait.toLowerCase().split(' ')
            .filter(word => word.length > 4);
            
        return traitList.some(existingTrait => {
            const existingKeywords = existingTrait.toLowerCase().split(' ')
                .filter(word => word.length > 4);
                
            const commonWords = keywords.filter(word => 
                existingKeywords.some(existing => 
                    existing.includes(word) || word.includes(existing)
                )
            );
            
            return commonWords.length > 0 && 
                   (commonWords.length / keywords.length) > 0.4;
        });
    }

    _personalizeResponse(response, userId) {
        const user = this.memoryDb.users[userId];
        if (!user) return response;
        
        return response;
    }

    _backupPersonality(personality, label) {
        try {
            if (!fs.existsSync(config.backupDir)) {
                fs.mkdirSync(config.backupDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const backupPath = path.join(
                config.backupDir, 
                `personality-${label}-${timestamp}.json`
            );
            
            fs.writeFileSync(backupPath, JSON.stringify(personality, null, 2), 'utf8');
            console.log(`✅ Backup da personalidade criado: ${backupPath}`);
            
            return true;
        } catch (error) {
            console.error(`❌ Erro ao fazer backup da personalidade: ${error.message}`);
            return false;
        }
    }

    _saveBasePersonality() {
        try {
            fs.writeFileSync(
                config.personalityFilePath, 
                JSON.stringify(this.basePersonality, null, 2),
                'utf8'
            );
            console.log(`✅ Personalidade base salva: ${this.basePersonality.personality.length} traços`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao salvar personalidade base: ${error.message}`);
            return false;
        }
    }

    _saveMemoryDb() {
        try {
            this._cleanupExpiredUsers();
            
            fs.writeFileSync(
                config.memoryDbPath,
                JSON.stringify(this.memoryDb, null, 2),
                'utf8'
            );
            return true;
        } catch (error) {
            console.error(`❌ Erro ao salvar banco de dados de memória: ${error.message}`);
            return false;
        }
    }

    _cleanupExpiredUsers() {
        const now = Date.now();
        const expiredUsers = [];
        
        for (const [userId, userData] of Object.entries(this.memoryDb.users)) {
            if (now - userData.lastInteraction > config.userProfileExpiry) {
                expiredUsers.push(userId);
            }
        }
        
        expiredUsers.forEach(userId => {
            delete this.memoryDb.users[userId];
        });
        
        if (expiredUsers.length > 0) {
            console.log(`🧹 Limpeza: ${expiredUsers.length} perfis de usuário expirados foram removidos`);
        }
    }

    _truncateMessage(message) {
        if (!message) return '';
        return message.length > 500 ? message.substring(0, 500) + '...' : message;
    }

    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getUserProfile(userId) {
        return this.memoryDb.users[userId] || null;
    }

    retrieveRelevantMemories(userId, context) {
        const user = this.memoryDb.users[userId];
        if (!user || !user.memories || user.memories.length === 0) {
            return [];
        }
        
        return user.memories
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3);
    }

    generatePersonalityInstructions(userId) {
        const user = this.memoryDb.users[userId];
        if (!user) return '';
        
        let instructions = "Responda como a Aninha, uma garota de 17 anos com personalidade real. ";
        
        if (user.traits[TRAIT_CATEGORIES.HUMOR]) {
            switch (user.traits[TRAIT_CATEGORIES.HUMOR]) {
                case 'brincalhão':
                    instructions += "Use muito humor, piadas e referências engraçadas. ";
                    break;
                case 'sarcástico':
                    instructions += "Seja bastante sarcástica e use humor ácido. ";
                    break;
                case 'sério':
                    instructions += "Mantenha um tom mais sério mas ainda jovem. ";
                    break;
                case 'alegre':
                    instructions += "Seja animada e positiva na sua resposta. ";
                    break;
            }
        }
        
        if (user.traits[TRAIT_CATEGORIES.FORMALITY]) {
            switch (user.traits[TRAIT_CATEGORIES.FORMALITY]) {
                case 'íntimo':
                    instructions += "Fale como se fosse uma amiga próxima dessa pessoa. ";
                    break;
                case 'distante':
                    instructions += "Mantenha uma certa distância na conversa. ";
                    break;
                case 'casual':
                    instructions += "Use um tom casual e descontraído. ";
                    break;
            }
        }
        
        if (user.traits[TRAIT_CATEGORIES.INTERESTS]) {
            instructions += `Demonstre interesse especial em ${user.traits[TRAIT_CATEGORIES.INTERESTS]}. `;
        }
        
        if (user.memories.length > 0) {
            instructions += "Você pode mencionar assuntos anteriores quando relevante. ";
        }
        
        return instructions.trim();
    }

    isSystemReady() {
        return !!this.basePersonality && !!this.memoryDb;
    }

    getStatistics() {
        return {
            users: Object.keys(this.memoryDb.users).length,
            totalAdaptations: this.memoryDb.evolutionStats.totalAdaptations,
            personalityVersions: this.memoryDb.evolutionStats.personalityVersions.length,
            baseTraits: this.basePersonality.personality.length,
            lastUpdate: this.memoryDb.evolutionStats.lastUpdate
        };
    }

    _preventExtremeAdaptations(newTraits, currentTraits = {}) {
        const adjustedTraits = { ...newTraits };
        
        const sensitiveTraits = [
            TRAIT_CATEGORIES.HUMOR,
            TRAIT_CATEGORIES.EMOTION,
            TRAIT_CATEGORIES.PERSONALITY
        ];
        
        const extremeValues = {
            [TRAIT_CATEGORIES.HUMOR]: ['extremamente sarcástico', 'ofensivo', 'cruel'],
            [TRAIT_CATEGORIES.EMOTION]: ['depressivo', 'instável', 'frio'],
            [TRAIT_CATEGORIES.PERSONALITY]: ['agressivo', 'manipulador', 'tóxico']
        };
        
        for (const traitCategory of sensitiveTraits) {
            if (adjustedTraits[traitCategory]) {
                const traitValue = adjustedTraits[traitCategory].toLowerCase();
                
                if (extremeValues[traitCategory].some(extreme => traitValue.includes(extreme))) {
                    console.log(`⚠️ Prevenindo adaptação extrema em ${traitCategory}: "${traitValue}"`);
                    
                    if (currentTraits[traitCategory]) {
                        adjustedTraits[traitCategory] = currentTraits[traitCategory];
                    } else {
                        delete adjustedTraits[traitCategory];
                    }
                }
            }
        }
        
        return adjustedTraits;
    }

    _isExtremeTraitContent(trait) {
        if (!trait) return false;
        
        const extremePatterns = [
            /extrem[ao]/i,
            /manipulad[ao]r/i,
            /crueldade/i,
            /ofensiv[ao]/i,
            /agress[iã]v[ao]/i,
            /toxic[ao]/i,
            /perigoso/i,
            /depriment[eo]/i,
            /perturbad[ao]/i,
            /sem limite/i,
            /antissocia[l]/i
        ];
        
        return extremePatterns.some(pattern => pattern.test(trait));
    }

    _isFoundationalTrait(trait) {
        if (!trait) return false;
        
        const foundationalKeywords = [
            "humor ácido",
            "frases curtas",
            "irônica",
            "sarcástica",
            "Aninha",
            "17 anos",
            "memes",
            "cultura da internet",
            "personalidade forte",
            "opinião",
            "TikTok"
        ];
        
        const lowerTrait = trait.toLowerCase();
        return foundationalKeywords.some(keyword => lowerTrait.includes(keyword.toLowerCase()));
    }
}

module.exports = new EvolutionaryLearning();

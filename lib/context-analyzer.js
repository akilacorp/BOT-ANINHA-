const { analyzeSentiment } = require('./sentiment-analyzer');


const TOPIC_CATEGORIES = {
    GAMES: 'games',              
    ANIME: 'anime',               
    MOVIES: 'movies',           
    MUSIC: 'music',              
    TECH: 'tech',                
    SCHOOL: 'school',             
    RELATIONSHIPS: 'relationships', 
    MEMES: 'memes',              
    FOOD: 'food',                
    SPORTS: 'sports',            
    POLITICS: 'politics',       
    FASHION: 'fashion',          
    MENTAL_HEALTH: 'mental_health', 
    HELP: 'help',                 
    SMALLTALK: 'smalltalk'        
};


const TOPIC_KEYWORDS = {
    [TOPIC_CATEGORIES.GAMES]: [
        'jogo', 'jogos', 'jogar', 'gamer', 'gaming', 'console', 'ps5', 'xbox', 'pc', 'steam', 'lol', 'league of legends',
        'cs2', 'csgo', 'counter strike', 'valorant', 'fortnite', 'minecraft', 'roblox', 'Free Fire', 'overwatch', 'warzone',
        'dota', 'rpg', 'mmorpg', 'fps', 'moba', 'battle royale', 'dlc', 'gameplay', 'streamer', 'gta', 'nintendo',
        'zelda', 'mario', 'pokémon', 'dbd', 'fifa', 'nba', 'god of war', 'dark souls', 'elden ring', 'assassin\'s creed',
        'jogador', 'partida', 'ranqueada', 'e-sports', 'competitivo'
    ],
    [TOPIC_CATEGORIES.ANIME]: [
        'anime', 'manga', 'otaku', 'waifu', 'husbando', 'naruto', 'one piece', 'demon slayer', 'kimetsu no yaiba',
        'my hero academia', 'boku no hero', 'attack on titan', 'shingeki no kyojin', 'dragon ball', 'jujutsu kaisen',
        'chainsaw man', 'spy x family', 'hunter x hunter', 'one punch man', 'fullmetal alchemist', 'tokyo ghoul',
        'haikyuu', 'death note', 'jojo', 'bleach', 'evangelion', 'ghibli', 'miyazaki', 'cosplay', 'mangaká', 'kawaii',
        'baka', 'senpai', 'yandere', 'tsundere', 'weeb', 'crunchyroll', 'funimation', 'shounen', 'shoujo', 'seinen',
        'isekai', 'shonen jump', 'slice of life', 'animação japonesa'
    ],
    [TOPIC_CATEGORIES.MOVIES]: [
        'filme', 'filmes', 'série', 'séries', 'cinema', 'netflix', 'hbo', 'disney+', 'prime video', 'star+', 'globoplay',
        'assistir', 'ator', 'atriz', 'diretor', 'marvel', 'dc', 'avengers', 'vingadores', 'harry potter', 'star wars',
        'oscar', 'hollywood', 'documentário', 'trailer', 'lançamento', 'bilheteria', 'episódio', 'temporada',
        'stranger things', 'game of thrones', 'breaking bad', 'the office', 'friends', 'greys anatomy', 'supernatural',
        'peaky blinders', 'casa de papel', 'bridgerton', 'euphoria', 'wandinha', 'the last of us'
    ],
    [TOPIC_CATEGORIES.MUSIC]: [
        'música', 'músicas', 'canção', 'ouvir', 'escutar', 'spotify', 'deezer', 'youtube music', 'apple music', 'playlist',
        'artista', 'banda', 'álbum', 'single', 'feat', 'show', 'concerto', 'festival', 'rock', 'pop', 'rap', 'trap', 'funk',
        'sertanejo', 'pagode', 'samba', 'mpb', 'metal', 'indie', 'eletrônica', 'lo-fi', 'remix', 'cover', 'clipe', 'mv',
        'letra', 'ao vivo', 'lançou', 'mc', 'dj', 'cantor', 'cantora', 'vocalista', 'guitarrista', 'tiktok song',
        'viral', 'hit', 'top 10', 'grammy', 'streaming'
    ],
    [TOPIC_CATEGORIES.TECH]: [
        'tecnologia', 'tech', 'celular', 'smartphone', 'iphone', 'android', 'computador', 'notebook', 'pc', 'mac',
        'windows', 'linux', 'app', 'aplicativo', 'software', 'hardware', 'programação', 'código', 'javascript', 'python',
        'java', 'c++', 'html', 'css', 'site', 'website', 'internet', 'wifi', 'bluetooth', 'usb', 'cabo', 'carregador',
        'bateria', 'memória', 'ssd', 'hd', 'ram', 'processador', 'gpu', 'placa de vídeo', 'inteligência artificial',
        'ia', 'ai', 'chatgpt', 'openai', 'google', 'microsoft', 'apple', 'samsung', 'xiaomi', 'huawei', 'realidade virtual',
        'vr', 'ar', 'realidade aumentada', 'criptomoeda', 'bitcoin', 'ethereum', 'nft'
    ],
    [TOPIC_CATEGORIES.SCHOOL]: [
        'escola', 'faculdade', 'universidade', 'colégio', 'estudar', 'estudando', 'prova', 'teste', 'exame', 'trabalho',
        'professor', 'professora', 'aluno', 'matéria', 'disciplina', 'dever de casa', 'lição', 'redação', 'matemática',
        'português', 'física', 'química', 'biologia', 'história', 'geografia', 'filosofia', 'sociologia', 'inglês',
        'enem', 'vestibular', 'fuvest', 'unicamp', 'sisu', 'bolsa', 'formatura', 'tcc', 'monografia', 'mestrado',
        'doutorado', 'pós-graduação', 'educação', 'ensinando', 'aprendendo', 'campus', 'biblioteca', 'semestre', 'notas'
    ],
    [TOPIC_CATEGORIES.RELATIONSHIPS]: [
        'crush', 'paquera', 'affair', 'ficante', 'namorado', 'namorada', 'ex', 'relacionamento', 'amor', 'paixão',
        'gostar', 'amar', 'ficar', 'dating', 'date', 'encontro', 'tinder', 'bumble', 'badoo', 'grindr', 'pegação',
        'solteiro', 'comprometido', 'casamento', 'noivado', 'família', 'namoro', 'término', 'brigar', 'discutindo',
        'ciúmes', 'traição', 'fidelidade', 'ghosting', 'friendzone', 'amizade', 'amigo', 'amiga', 'bff', 'melhor amigo'
    ],
    [TOPIC_CATEGORIES.MEMES]: [
        'meme', 'memes', 'zueira', 'zoeira', 'trollar', 'trollagem', 'troll', 'shitpost', 'shitposting', 'dank meme',
        'trend', 'viral', 'kkkk', 'hahaha', 'engraçado', 'lol', 'risada', 'piada', 'humor', 'gozado', 'parodia',
        'sarcasmo', 'ironia', 'deboche', 'copypasta', 'tiktok', 'reels', 'shorts', 'reaction', 'react', 'challenge',
        'desafio', 'cringe', 'based', 'chad', 'sigma', 'alpha', 'normie', 'cursed', 'blessed', 'pov', 'quando', 'quando eu',
        'ninguém', 'nobody', 'eu e os', 'me and the boys', 'stonks', 'não é possível', 'não acredito', 'faz o L', 'mito'
    ],
    [TOPIC_CATEGORIES.FOOD]: [
        'comida', 'comer', 'fome', 'restaurante', 'lanchonete', 'fast food', 'delivery', 'ifood', 'uber eats', 'rappi',
        'pedido', 'pedir', 'hambúrguer', 'hamburguer', 'pizza', 'churrasco', 'japonês', 'sushi', 'temaki', 'yakisoba',
        'massa', 'macarrão', 'espaguete', 'lasanha', 'carne', 'frango', 'peixe', 'vegetariano', 'vegano', 'café da manhã',
        'almoço', 'jantar', 'lanche', 'sobremesa', 'doce', 'salgado', 'bebida', 'refrigerante', 'suco', 'água',
        'cerveja', 'álcool', 'receita', 'cozinhar', 'frito', 'assado', 'cozido', 'grelhado'
    ],
    [TOPIC_CATEGORIES.SPORTS]: [
        'esporte', 'esportes', 'futebol', 'volei', 'basquete', 'basquetebol', 'tênis', 'natação', 'atletismo', 'corrida',
        'maratona', 'ciclismo', 'surf', 'skate', 'ufc', 'mma', 'boxe', 'luta', 'golfe', 'time', 'jogador', 'atleta',
        'treinador', 'técnico', 'campeonato', 'liga', 'copa', 'mundial', 'olimpíadas', 'treino', 'academia', 'musculação',
        'crossfit', 'fitness', 'workout', 'personal', 'exercício', 'físico', 'malhar', 'malhação', 'gol', 'ponto',
        'partida', 'flamengo', 'corinthians', 'palmeiras', 'são paulo', 'santos', 'cruzeiro', 'vasco', 'grêmio',
        'internacional', 'neymar', 'messi', 'cristiano ronaldo', 'cr7', 'lebron', 'nba', 'formula 1', 'f1'
    ],
    [TOPIC_CATEGORIES.POLITICS]: [
        'política', 'político', 'presidente', 'governador', 'prefeito', 'senador', 'deputado', 'vereador', 'ministro',
        'ministério', 'congresso', 'votação', 'votar', 'eleição', 'direita', 'esquerda', 'centro', 'conservador',
        'progressista', 'liberal', 'partido', 'pt', 'psdb', 'psl', 'pl', 'mdb', 'bolsonaro', 'lula', 'governo',
        'economia', 'inflação', 'desemprego', 'crise', 'corrupção', 'escândalo', 'fake news', 'manifestação', 'protesto',
        'democracia', 'ditadura', 'autoritarismo', 'fascismo', 'comunismo', 'socialismo', 'capitalismo', 'reforma',
        'proposta', 'lei', 'projeto', 'stf', 'supremo tribunal', 'impeachment'
    ],
    [TOPIC_CATEGORIES.FASHION]: [
        'moda', 'roupa', 'roupas', 'vestir', 'vestido', 'camiseta', 'calça', 'jeans', 'casaco', 'jaqueta', 'blusa',
        'moletom', 'tênis', 'sapato', 'maquiagem', 'makeup', 'batom', 'sombra', 'delineador', 'cabelo', 'corte', 'penteado',
        'tingir', 'loiro', 'ruivo', 'moreno', 'estilo', 'look', 'outfit', 'fashion', 'fashionista', 'designer',
        'grife', 'marca', 'gucci', 'prada', 'louis vuitton', 'chanel', 'zara', 'h&m', 'shein', 'aesthetic', 'y2k',
        'vintage', 'retrô', 'alternativo', 'egirl', 'eboy', 'cottagecore', 'academia', 'casual', 'formal', 'elegante',
        'street', 'streetwear', 'hypebeast'
    ],
    [TOPIC_CATEGORIES.MENTAL_HEALTH]: [
        'saúde mental', 'terapia', 'psicólogo', 'psiquiatra', 'ansiedade', 'depressão', 'transtorno', 'trauma',
        'autoestima', 'insegurança', 'burnout', 'estresse', 'estressado', 'cansado', 'exausto', 'esgotado',
        'desânimo', 'sem energia', 'sem motivação', 'desinteresse', 'tristeza', 'choro', 'suicídio', 'automutilação',
        'cutting', 'medicação', 'psiquiátrico', 'diagnóstico', 'tdah', 'déficit de atenção', 'bipolar', 'compulsão',
        'obsessão', 'ataque de pânico', 'fobia', 'medo', 'desespero', 'angústia', 'sofrendo', 'sofrimento', 'ajuda',
        'apoio', 'conforto', 'conselho', 'orientação', 'lidar', 'enfrentar', 'superar'
    ],
    [TOPIC_CATEGORIES.HELP]: [
        'ajudar', 'ajuda', 'socorro', 'preciso', 'urgente', 'necessito', 'dúvida', 'questão', 'problema', 'resolver',
        'solução', 'conselho', 'aconselhar', 'dica', 'sugestão', 'opinião', 'o que fazer', 'como faço', 'me ensina',
        'explica', 'explique', 'esclarecer', 'recomendar', 'recomendação', 'indicar', 'indicação', 'sos', 'emergência',
        'crítico', 'sério', 'importante', 'decisão', 'escolher', 'escolha', 'difícil', 'complicado', 'não sei', 'confuso'
    ],
    [TOPIC_CATEGORIES.SMALLTALK]: [
        'oi', 'olá', 'oie', 'eai', 'e aí', 'ei', 'hey', 'hello', 'hi', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem',
        'como vai', 'como está', 'beleza', 'tranquilo', 'de boa', 'suave', 'firmeza', 'na paz', 'qual seu nome', 'quem é você',
        'gostou', 'legal', 'bacana', 'massa', 'top', 'maneiro', 'daora', 'que faz', 'fazendo o que', 'ocupado', 'livre',
        'fim de semana', 'ontem', 'hoje', 'amanhã', 'tempo', 'clima', 'chovendo', 'sol', 'frio', 'calor', 'tchau', 'até mais',
        'até logo', 'flw', 'vlw', 'obrigado', 'obrigada', 'valeu', 'thanks', 'blz', 'ok', 'certo', 'entendi', 'saquei'
    ]
};


const TOPIC_MATCH_THRESHOLD = 2;


const CONVERSATION_HISTORY_LIMIT = 10;


const conversationHistories = new Map();

class ConversationContext {
    constructor(chatId) {
        this.chatId = chatId;
        this.messages = [];
        this.currentTopic = null;
        this.topicConfidence = 0;
        this.topicStartTime = null;
        this.detectedEntities = new Map();
        this.lastActive = Date.now();
    }

    addMessage(message) {
        this.messages.push({
            ...message,
            timestamp: Date.now()
        });
        
        if (this.messages.length > CONVERSATION_HISTORY_LIMIT) {
            this.messages.shift();
        }
        
        this.lastActive = Date.now();
    }

    getMessages(limit = CONVERSATION_HISTORY_LIMIT) {
        return this.messages.slice(-limit);
    }

    setTopic(topic, confidence) {
        if (this.currentTopic !== topic) {
            this.currentTopic = topic;
            this.topicStartTime = Date.now();
        }
        
        this.topicConfidence = confidence;
        this.lastActive = Date.now();
    }

    addEntity(type, value, importance = 0.5) {
        if (!this.detectedEntities.has(type)) {
            this.detectedEntities.set(type, new Map());
        }
        
        const entityMap = this.detectedEntities.get(type);
        entityMap.set(value, {
            value,
            importance,
            lastMentioned: Date.now(),
            mentionCount: (entityMap.get(value)?.mentionCount || 0) + 1
        });
    }

    getRelevantEntities(type = null, limit = 5) {
        if (type && this.detectedEntities.has(type)) {
            const entities = Array.from(this.detectedEntities.get(type).values());
            return this._sortEntitiesByRelevance(entities).slice(0, limit);
        }
        
        const allEntities = [];
        for (const entityMap of this.detectedEntities.values()) {
            allEntities.push(...entityMap.values());
        }
        
        return this._sortEntitiesByRelevance(allEntities).slice(0, limit);
    }

    _sortEntitiesByRelevance(entities) {
        return entities.sort((a, b) => {
            const recencyA = Math.max(0, 1 - (Date.now() - a.lastMentioned) / (24 * 60 * 60 * 1000));
            const recencyB = Math.max(0, 1 - (Date.now() - b.lastMentioned) / (24 * 60 * 60 * 1000));
            
            const scoreA = a.importance * a.mentionCount * (recencyA + 0.5);
            const scoreB = b.importance * b.mentionCount * (recencyB + 0.5);
            
            return scoreB - scoreA;
        });
    }

    isActive(timeout = 30 * 60 * 1000) {
        return (Date.now() - this.lastActive) < timeout;
    }
}

function getConversationContext(chatId) {
    if (!conversationHistories.has(chatId)) {
        conversationHistories.set(chatId, new ConversationContext(chatId));
    }
    
    return conversationHistories.get(chatId);
}

function cleanInactiveConversations(timeout = 2 * 60 * 60 * 1000) {
    for (const [chatId, context] of conversationHistories.entries()) {
        if (!context.isActive(timeout)) {
            conversationHistories.delete(chatId);
        }
    }
}

setInterval(cleanInactiveConversations, 30 * 60 * 1000);

function detectTopics(message) {
    const lowerMessage = message.toLowerCase();
    const topicScores = {};
    let totalMatches = 0;

    Object.values(TOPIC_CATEGORIES).forEach(category => {
        topicScores[category] = 0;
    });
    
    for (const category in TOPIC_KEYWORDS) {
        const keywords = TOPIC_KEYWORDS[category];
        let categoryMatches = 0;
        
        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                categoryMatches++;
                totalMatches++;
            }
        }
        
        topicScores[category] = categoryMatches;
    }
    
    let highestScore = 0;
    let mainTopic = TOPIC_CATEGORIES.SMALLTALK;
    
    for (const topic in topicScores) {
        if (topicScores[topic] > highestScore) {
            highestScore = topicScores[topic];
            mainTopic = topic;
        }
    }
    
    const confidenceScore = highestScore / (totalMatches || 1);

    if (highestScore >= TOPIC_MATCH_THRESHOLD) {
        return {
            topic: mainTopic,
            confidence: confidenceScore,
            allTopics: Object.entries(topicScores)
                .filter(([_, score]) => score > 0)
                .sort((a, b) => b[1] - a[1])
        };
    }

    return {
        topic: TOPIC_CATEGORIES.SMALLTALK,
        confidence: 0.5,
        allTopics: [{topic: TOPIC_CATEGORIES.SMALLTALK, score: 1}]
    };
}

function extractEntities(message) {
    const entities = {};
    
    const properNamesRegex = /\b[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})*\b/g;
    const properNames = message.match(properNamesRegex) || [];
    
    if (properNames.length > 0) {
        entities.PERSON = properNames;
    }
    

    const lowerMessage = message.toLowerCase();
    

    const games = TOPIC_KEYWORDS[TOPIC_CATEGORIES.GAMES].filter(game => 
        lowerMessage.includes(game.toLowerCase()) && game.length > 3
    );
    
    if (games.length > 0) {
        entities.GAME = games;
    }
    

    const animes = TOPIC_KEYWORDS[TOPIC_CATEGORIES.ANIME].filter(anime => 
        lowerMessage.includes(anime.toLowerCase()) && anime.length > 3
    );
    
    if (animes.length > 0) {
        entities.ANIME = animes;
    }
    
    return entities;
}

function processMessage(chatId, message, sender) {
    const context = getConversationContext(chatId);

    const topicInfo = detectTopics(message);
    
    const entities = extractEntities(message);

    const sentiment = analyzeSentiment(message);
    
    context.addMessage({
        text: message,
        sender,
        topics: topicInfo,
        sentiment,
        entities
    });
    
    if (topicInfo.confidence > 0.6 || (context.currentTopic === null && topicInfo.confidence > 0.4)) {
        context.setTopic(topicInfo.topic, topicInfo.confidence);
    }
    
    for (const entityType in entities) {
        for (const entity of entities[entityType]) {
            const isRelevantToTopic = (entityType === 'GAME' && context.currentTopic === TOPIC_CATEGORIES.GAMES) ||
                                     (entityType === 'ANIME' && context.currentTopic === TOPIC_CATEGORIES.ANIME);
            
            const importance = isRelevantToTopic ? 0.8 : 0.5;
            context.addEntity(entityType, entity, importance);
        }
    }
    
    return {
        context,
        mainTopic: topicInfo.topic,
        confidence: topicInfo.confidence,
        sentiment
    };
}

function generateContextInstructions(chatId) {
    const context = getConversationContext(chatId);
    
    if (!context || context.messages.length === 0) {
        return null;
    }

    const recentMessages = context.getMessages(5);

    const currentTopic = context.currentTopic || 'conversa casual';
    
    const relevantEntities = context.getRelevantEntities(null, 3);
    
    const sentiments = recentMessages.map(m => m.sentiment.category);
    const sentimentCounts = sentiments.reduce((acc, sentiment) => {
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
    }, {});
    
    const dominantSentiment = Object.entries(sentimentCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([sentiment]) => sentiment)[0] || 'neutral';
    
    const totalMessages = context.messages.length;
    const isNewConversation = totalMessages < 3;
    const isEstablishedConversation = totalMessages > 5;
    
    return {
        currentTopic,
        topicConfidence: context.topicConfidence,
        dominantSentiment,
        conversationState: isNewConversation ? 'início' : (isEstablishedConversation ? 'estabelecida' : 'em andamento'),
        relevantEntities: relevantEntities.map(e => e.value),
        recentMessagesCount: recentMessages.length,
        isUserEngaged: recentMessages.length >= 3 && recentMessages.filter(m => m.sender !== 'bot').length > 1
    };
}

function formatContextForPrompt(chatId) {
    const contextInfo = generateContextInstructions(chatId);
    
    if (!contextInfo) {
        return '';
    }
    
    let contextPrompt = '\nContexto da conversa:';
    
    if (contextInfo.currentTopic && contextInfo.currentTopic !== 'smalltalk') {
        contextPrompt += `\n- Tópico atual: ${contextInfo.currentTopic}`;
    }
    
    if (contextInfo.dominantSentiment && contextInfo.dominantSentiment !== 'neutral') {
        contextPrompt += `\n- Tom emocional: ${contextInfo.dominantSentiment}`;
    }
    
    if (contextInfo.relevantEntities && contextInfo.relevantEntities.length > 0) {
        contextPrompt += `\n- Menções importantes: ${contextInfo.relevantEntities.join(', ')}`;
    }
    
    if (contextInfo.isUserEngaged) {
        contextPrompt += '\n- Usuário engajado na conversa';
    } else if (contextInfo.conversationState === 'início') {
        contextPrompt += '\n- Início de conversa (seja receptiva)';
    }
    
    return contextPrompt;
}


module.exports = {
    TOPIC_CATEGORIES,
    processMessage,
    detectTopics,
    getConversationContext,
    generateContextInstructions,
    formatContextForPrompt,
    cleanInactiveConversations
};

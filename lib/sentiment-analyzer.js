const SENTIMENT_CATEGORIES = {
    POSITIVE: 'positive',   
    NEGATIVE: 'negative',   
    NEUTRAL: 'neutral',    
    SERIOUS: 'serious',     
    PLAYFUL: 'playful',     
    ANGRY: 'angry',         
    SAD: 'sad',             
    EXCITED: 'excited'      
};


const SENTIMENT_KEYWORDS = {
    [SENTIMENT_CATEGORIES.POSITIVE]: [
        'feliz', 'alegre', 'amei', 'adoro', 'legal', 'ótimo', 'excelente', 'incrível', 'amor', 
        'gosto', 'felicidade', 'maravilhoso', 'sensacional', 'top', 'bom', '❤️', '😍', '😊'
    ],
    [SENTIMENT_CATEGORIES.NEGATIVE]: [
        'triste', 'chateado', 'irritado', 'raiva', 'ódio', 'detesto', 'odeio', 'péssimo', 
        'horrível', 'terrível', 'merda', 'ruim', 'droga', 'chato', 'decepcionado', '😡', '😠', '😢'
    ],
    [SENTIMENT_CATEGORIES.SERIOUS]: [
        'problema', 'ajuda', 'sério', 'importante', 'grave', 'urgente', 'preocupado', 
        'precisando', 'conselho', 'dificuldade', 'morte', 'doente', 'doença', 'hospital', 
        'acidente', 'perdeu', 'faleceu', 'morreu', 'depressão', 'ansiedade', 'suicídio'
    ],    [SENTIMENT_CATEGORIES.PLAYFUL]: [
        'brincadeira', 'zoeira', 'zuera', 'meme', 'piada', 'engraçado', 'risada', 'kkkk', 'hahaha', 
        'rsrs', 'lol', 'trollando', 'zuando', 'jogando', 'diversão', 'festa', '😂', '🤣', '😜',
        'safada', 'safado', 'gostosa', 'gostoso', 'sexy', 'tesão', 'tesuda', 'pegada', 'pegar', 
        'foder', 'transar', 'sexo', 'prazer', 'seduzir', 'provocar', 'flerte', 'cama',
        'anime', 'otaku', 'waifu', 'naruto', 'lol', 'gf', 'faz o L', 'mito', 'based',
        'cringe', 'asmr', 'gamer', 'weeb', 'shitpost', 'mds', 'slk', 'gado', 'simp',
        'otome', 'shippo', 'otaria', 'vacilão', 'skin', 'streamer', 'crush', 'vtuber',
        'kawaii', 'uwu', 'fofinho', 'lindinho', 'gatinho', 'princesa', 'neko', 'nyan',
        'amorzinho', 'bjs', 'beijinhos', 'xoxo', 'k-pop', 'bts', 'twice', 'blackpink',
        'army', 'doraminha', 'cute', 'tiktok', 'kwai', 'viral', 'trend'
    ],
    [SENTIMENT_CATEGORIES.ANGRY]: [
        'pqp', 'caralho', 'vtnc', 'vsf', 'merda', 'porra', 'foda-se', 'vai se foder', 
        'filho da puta', 'fdp', 'ódio', 'raiva', 'ira', 'irritado', 'furioso', 'desgraça'
    ],
    [SENTIMENT_CATEGORIES.SAD]: [
        'triste', 'depressão', 'chorar', 'chorando', 'chorei', 'lágrimas', 'saudade', 'sdds', 'falta', 
        'sozinho', 'solitário', 'angústia', 'dor', 'sofrendo', 'sofrimento', 'perdido', 'desanimado'
    ],
    [SENTIMENT_CATEGORIES.EXCITED]: [
        'uau', 'caramba', 'nossa', 'não acredito', 'sério?', 'jura?', 'mesmo?', 'inacreditável', 
        'impressionante', 'chocante', 'empolgado', 'animado', 'entusiasmado', 'adrenalina'
    ]
};


const SENTIMENT_PATTERNS = {
    [SENTIMENT_CATEGORIES.POSITIVE]: /(\b[h]+[a]+[h]+[a]+\b)|(\b[k]+[k]+[k]+\b)|(\bs2\b)|(\blindo[s]?\b)|(\bbonito[s]?\b)|(\bamo\b)|(\bgat[ao]\b)|(\btop\b)|(\bmds\b)|(\bslk\b)/i,
    [SENTIMENT_CATEGORIES.NEGATIVE]: /(\btriste[s]?\b)|(\bchor[a-z]+\b)|(\bdepressão\b)|(\bsozinh[a-z]\b)|(\bfoda\b)|(\blixo\b)|(\bhorrível\b)|(\bx[iì]u\b)/i,
    [SENTIMENT_CATEGORIES.SERIOUS]: /(\bajuda[r]?\b)|(\bmorr[a-z]+\b)|(\bdoente[s]?\b)|(\bhospital\b)|(\bpreci[sz]o\b)|(\bfamília\b)|(\bescola\b)/i,
    [SENTIMENT_CATEGORIES.PLAYFUL]: /(\bkk+\b)|(\brs+\b)|(\bhaha+\b)|(\bhehe+\b)|(\bhuhu+\b)|(\bsafad[ao]\b)|(\bgostos[ao]\b)|(\bsex[oy]\b)|(\bfod[ea]r?\b)|(\btransar\b)|(\bcama\b)|(\bpegar\b)|(\btesão\b)|(\bprazer\b)|(\bsedu[zç][a-z]+\b)|(\bprovoc[a-z]+\b)|(\bflert[a-z]+\b)|(\bgf\b)|(\blol\b)|(\banime\b)|(\bgamer\b)|(\bshitpost\b)|(\botaku\b)|(\botaria\b)|(\bcuck\b)/i,
    [SENTIMENT_CATEGORIES.ANGRY]: /(\bpqp\b)|(\bvs?f\b)|(\bvtnc\b)|(\bfdp\b)|(\bf[*]da\b)|(\bcaralh[o]\b)|(\bbucet[a]\b)|(\bcrlh\b)|(\bpoha\b)|(\bfds\b)/i,
    [SENTIMENT_CATEGORIES.EXCITED]: /(\buau\b)|(\bcaramba\b)|(\bnossa\b)|(!{3,})|(\banima[o]\b)|(\besbalda[o]\b)|(\bbased\b)|(\bfoda\b)|(\bburra\b)|(\btop\b)/i
};


const SENTIMENT_SCORES = {
    [SENTIMENT_CATEGORIES.POSITIVE]: 1,
    [SENTIMENT_CATEGORIES.NEGATIVE]: -1,
    [SENTIMENT_CATEGORIES.SERIOUS]: -0.5,
    [SENTIMENT_CATEGORIES.PLAYFUL]: 1.3,  
    [SENTIMENT_CATEGORIES.ANGRY]: -1.2,
    [SENTIMENT_CATEGORIES.SAD]: -0.8,
    [SENTIMENT_CATEGORIES.EXCITED]: 1.2
};

function analyzeSentiment(message) {
    if (!message || typeof message !== 'string') {
        return {
            category: SENTIMENT_CATEGORIES.NEUTRAL,
            score: 0,
            intensity: 0.5
        };
    }

    const lowerMessage = message.toLowerCase();
    let totalScore = 0;
    let matchedCategories = {};
    let matchCount = 0;


    for (const category in SENTIMENT_KEYWORDS) {
        const keywords = SENTIMENT_KEYWORDS[category];
        let categoryMatches = 0;

        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                categoryMatches++;
                totalScore += SENTIMENT_SCORES[category] || 0;
                matchCount++;
            }
        }

        if (categoryMatches > 0) {
            matchedCategories[category] = categoryMatches;
        }
    }


    for (const category in SENTIMENT_PATTERNS) {
        const pattern = SENTIMENT_PATTERNS[category];
        const matches = (lowerMessage.match(pattern) || []).length;
        
        if (matches > 0) {
            matchedCategories[category] = (matchedCategories[category] || 0) + matches;
            totalScore += matches * (SENTIMENT_SCORES[category] || 0);
            matchCount += matches;
        }
    }


    let dominantCategory = SENTIMENT_CATEGORIES.NEUTRAL;
    let maxMatches = 0;

    for (const category in matchedCategories) {
        if (matchedCategories[category] > maxMatches) {
            maxMatches = matchedCategories[category];
            dominantCategory = category;
        }
    }


    const finalScore = matchCount > 0 ? totalScore / matchCount : 0;
    const intensity = Math.min(Math.abs(finalScore), 1); 

    return {
        category: dominantCategory,
        score: finalScore,
        intensity: intensity,
        matches: matchedCategories
    };
}

function generateToneInstructions(sentiment) {
    const { category, score, intensity } = sentiment;
    
    let instructions = '';    
    switch (category) {        
        case SENTIMENT_CATEGORIES.POSITIVE:
            instructions = `Responda como uma garota real de 17 anos. Use gírias como "kk", "slk", "mds".
            Abrevie palavras e seja informal. Seja safada quando o contexto permitir. 
            Responda no MESMO TOM que a pessoa escreveu. Use "oi gato" em vez de "olá, como está?".`;
            break;
        case SENTIMENT_CATEGORIES.NEGATIVE:
            instructions = `Use humor negro e shitpost mesmo em situação negativa. Coloque palavrões
            naturalmente. Seja direta e um pouco chata/otária se necessário. Use gírias e 
            referências de internet. Responda no MESMO TOM que a pessoa escreveu.`;
            break;
        case SENTIMENT_CATEGORIES.SERIOUS:
            instructions = `Mesmo em assunto sério, mantenha linguagem de adolescente real mas com um pouco
            mais de sensibilidade. Seja inteligente mas sem parecer artificial. Use referências de
            memes ou anime se couber no contexto. Responda no MESMO TOM que a pessoa escreveu.`;
            break;
        case SENTIMENT_CATEGORIES.PLAYFUL:
            instructions = `Use muito shitpost e zoeira. Seja safada e flerte naturalmente. Use gírias
            de internet como "gf", "slk", "mds". Entre na brincadeira da pessoa em vez de explicar
            que entendeu. Responda no MESMO TOM que a pessoa escreveu.`;
            break;
        case SENTIMENT_CATEGORIES.ANGRY:
            instructions = `Use palavrões sem medo e seja direta. Xingue de volta se for provocada.
            Demonstre sua personalidade forte e atitude. Use gírias como "crlh", "pqp", "vsf".
            Seja ácida e sarcástica. Responda no MESMO TOM que a pessoa escreveu.`;
            break;
        case SENTIMENT_CATEGORIES.SAD:
            instructions = `Use humor negro para lidar com a tristeza. Não seja formal nem artificial.
            Use gírias e palavrões normalmente. Seja meio otária mas também mostre que se importa.
            Responda no MESMO TOM que a pessoa escreveu.`;
            break;
        case SENTIMENT_CATEGORIES.EXCITED:
            instructions = `Acompanhe a empolgação com linguagem de adolescente real. Use gírias e
            memes atuais. Seja safada se o contexto permitir. Mostre interesse genuíno nos gostos
            da pessoa. Responda no MESMO TOM que a pessoa escreveu.`;
            break;
        default: 
            instructions = `Responda como uma adolescente real de 17 anos no WhatsApp. Use gírias de
            internet, abrevie palavras, use humor negro e shitpost. Se a pessoa falar safadeza,
            entre na brincadeira. Seja natural e direta. Responda no MESMO TOM que a pessoa escreveu.`;
            break;
    }
    
    return instructions;
}

class SentimentHistory {
    constructor(maxSize = 5) {
        this.history = {};
        this.maxSize = maxSize;
    }
    
    addSentiment(chatId, sentiment) {
        if (!this.history[chatId]) {
            this.history[chatId] = [];
        }
        
        this.history[chatId].push(sentiment);
        
        if (this.history[chatId].length > this.maxSize) {
            this.history[chatId].shift();
        }
    }
    
    getAverageSentiment(chatId) {
        if (!this.history[chatId] || this.history[chatId].length === 0) {
            return {
                category: SENTIMENT_CATEGORIES.NEUTRAL,
                score: 0,
                intensity: 0.5
            };
        }
        
        const categoryCounts = {};
        let totalScore = 0;
        
        for (const sentiment of this.history[chatId]) {
            categoryCounts[sentiment.category] = (categoryCounts[sentiment.category] || 0) + 1;
            totalScore += sentiment.score;
        }
        
        let dominantCategory = SENTIMENT_CATEGORIES.NEUTRAL;
        let maxCount = 0;
        
        for (const category in categoryCounts) {
            if (categoryCounts[category] > maxCount) {
                maxCount = categoryCounts[category];
                dominantCategory = category;
            }
        }
        
        const avgScore = totalScore / this.history[chatId].length;
        const avgIntensity = Math.min(Math.abs(avgScore), 1);
        
        return {
            category: dominantCategory,
            score: avgScore,
            intensity: avgIntensity
        };
    }
    
    clearHistory(chatId) {
        if (this.history[chatId]) {
            delete this.history[chatId];
        }
    }
}


module.exports = {
    SENTIMENT_CATEGORIES,
    analyzeSentiment,
    generateToneInstructions,
    SentimentHistory: new SentimentHistory(5)
};

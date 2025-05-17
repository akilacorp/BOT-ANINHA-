
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);


const STICKERS_DIR = path.join(__dirname, '..', 'stickers');


const STICKER_CATEGORIES = {
    'risada': ['kkkk', 'hahaha', 'rsrs', 'lol', 'piada', 'engraçado', 'morri', 'zueira'],
    'raiva': ['ódio', 'raiva', 'irritado', 'pqp', 'caralho', 'vtnc', 'vsf', 'merda', 'foda-se'],
    'triste': ['triste', 'depressão', 'chorar', 'chorei', 'chorando', 'bad', 'tristeza'],
    'amor': ['amor', 'beijo', 'te amo', 'gosto de você', 'sdds', 'saudade', 'coração'],
    'surpresa': ['nossa', 'caramba', 'sério', 'mentira', 'não acredito', 'omg', 'eita', 'uau'],
    'comida': ['comida', 'fome', 'comer', 'lanche', 'pizza', 'hamburguer', 'delícia'],
    'sono': ['sono', 'dormir', 'cansado', 'cansada', 'preguiça', 'boa noite'],
    'sarcasmo': ['sarcasmo', 'ironia', 'aham', 'sei', 'duvido', 'conta outra'],
    'festa': ['festa', 'balada', 'beber', 'cerveja', 'álcool', 'final de semana', 'sexta'],
    'memes': ['meme', 'zuera', 'zoeira', 'viral', 'tendência']
};


const STICKER_PROBABILITY = 0.20; 

/**
 * 
 * @param {string} message 
 * @returns {boolean} 
 */
function shouldSendSticker(message) {
    if (Math.random() > STICKER_PROBABILITY) {
        return false;
    }

    const lowerMessage = message.toLowerCase();
    
    for (const category in STICKER_CATEGORIES) {
        const keywords = STICKER_CATEGORIES[category];
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return true;
        }
    }
    
    const hasMultipleEmojis = /(\p{Emoji}\p{Emoji}+)/gu.test(message);
    const hasExclamations = /!{3,}/.test(message);
    const hasQuestions = /\?{3,}/.test(message);
    
    return hasMultipleEmojis || hasExclamations || hasQuestions;
}

/**
 *
 * @param {string} message 
 * @returns {string|null}
 */
function identifyCategory(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const category in STICKER_CATEGORIES) {
        const keywords = STICKER_CATEGORIES[category];
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return category;
        }
    }
    
    if (/[ha]{3,}|kk+|rs+/i.test(lowerMessage)) {
        return 'risada';
    } else if (/[!]{3,}/.test(message)) {
        return 'surpresa';
    } else if (/[?]{3,}/.test(message)) {
        return 'surpresa';
    }
    
    const categories = Object.keys(STICKER_CATEGORIES);
    return categories[Math.floor(Math.random() * categories.length)];
}

/**
 * 
 * @param {string} category 
 * @returns {Promise<string|null>} 
 */
async function getRandomStickerPath(category = null) {
    try {
        try {
            await stat(STICKERS_DIR);
        } catch (err) {
            console.error(`❌ Diretório de stickers não encontrado: ${STICKERS_DIR}`);
            return null;
        }
        
        const files = await readdir(STICKERS_DIR);
        if (!files || files.length === 0) {
            console.warn(`⚠️ Nenhum sticker encontrado em: ${STICKERS_DIR}`);
            return null;
        }
        
        let validStickers = files.filter(file => {
            return file.endsWith('.webp') || file.endsWith('.png');
        });
        
        if (category) {
            validStickers = validStickers.filter(file => {
                return file.toLowerCase().includes(category.toLowerCase());
            });
        }
        
        if (validStickers.length === 0) {
            validStickers = files.filter(file => {
                return file.endsWith('.webp') || file.endsWith('.png');
            });
        }
        
        if (validStickers.length === 0) {
            return null;
        }
        
        const randomSticker = validStickers[Math.floor(Math.random() * validStickers.length)];
        return path.join(STICKERS_DIR, randomSticker);
    } catch (error) {
        console.error('❌ Erro ao obter sticker aleatório:', error);
        return null;
    }
}

async function sendSticker(sock, jid, quotedMessage, category = null) {
    try {
        const stickerPath = await getRandomStickerPath(category);
        if (!stickerPath) {
            console.warn('⚠️ Nenhum sticker disponível para enviar');
            return false;
        }
        
        await sock.sendMessage(
            jid, 
            { sticker: { url: stickerPath } },
            { quoted: quotedMessage }
        );
        
        console.log(`🎭 Sticker enviado da categoria: ${category || 'aleatória'}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao enviar sticker:', error);
        return false;
    }
}

module.exports = {
    shouldSendSticker,
    identifyCategory,
    getRandomStickerPath,
    sendSticker
};

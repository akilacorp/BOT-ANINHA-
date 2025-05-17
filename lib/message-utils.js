
const BOT_PREFIX = '!';  
const BOT_NAMES = ['aninha', 'ani', 'nina', 'aninhabot', 'bot']; 

function cleanMessage(message) {
    if (!message || typeof message !== 'string') return '';
    
  
    let cleaned = message.trim()
        .replace(/\s+/g, ' ')      
        .replace(/[\u200B-\u200D\uFEFF]/g, ''); 
    
    return cleaned;
}

function extractCommand(message, prefix = BOT_PREFIX) {
    if (!message || typeof message !== 'string') return null;
    
    const cleanedMessage = cleanMessage(message);
    
    if (!cleanedMessage.startsWith(prefix)) return null;
    
    const parts = cleanedMessage.slice(prefix.length).trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    return { command, args };
}

function isMediaMessage(message) {
    if (!message) return false;
    
    return !!(message.hasMedia || 
             message.type === 'image' || 
             message.type === 'video' || 
             message.type === 'audio' || 
             message.type === 'document' ||
             message.type === 'sticker' ||
             message.type === 'ptt');
}

function shouldIgnoreMessage(message) {
    if (!message) return true;
    
    if (message.from === 'status@broadcast') return true;
    
    if (message.fromMe) return true;
    
    if (!message.body || message.body.trim() === '') return true;
    
    return false;
}

async function getMessageInfo(message, commandPrefix = BOT_PREFIX) {
    const info = {
        chatId: message.from,
        senderId: message.author || message.from,
        messageId: message.id._serialized || message.id,
        isGroup: message.from.endsWith('@g.us'),
        body: message.body || '',
        cleanBody: cleanMessage(message.body || ''),
        timestamp: message.timestamp || Date.now(),
        hasMedia: isMediaMessage(message),
        shouldIgnore: shouldIgnoreMessage(message),
        mentionsBot: false,
        isCommand: false,
        command: null,
        commandArgs: []
    };
    
    const commandData = extractCommand(info.body, commandPrefix);
    if (commandData) {
        info.isCommand = true;
        info.command = commandData.command;
        info.commandArgs = commandData.args;
    }
    
    if (info.isGroup) {
        const lowerBody = info.cleanBody.toLowerCase();
        
        info.mentionsBot = BOT_NAMES.some(name => 
            lowerBody.includes(name) ||
            lowerBody.startsWith(name)
        );
        
        if (info.isCommand) {
            info.mentionsBot = true;
        }
        
        try {
            const mentions = await message.getMentions();
        } catch (error) {
        }
    } else {
        info.mentionsBot = true;
    }
    
    return info;
}

module.exports = {
    cleanMessage,
    extractCommand,
    isMediaMessage,
    shouldIgnoreMessage,
    getMessageInfo,
    BOT_PREFIX,
    BOT_NAMES
};

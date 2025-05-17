
/**
 * 
 * @param {Object} sock 
 * @param {String} jid 
 * @param {String} text 
 * @param {Object} quotedMessage 
 * @returns {Promise<Object>} 
 */
async function sendQuotedReply(sock, jid, text, quotedMessage) {
    try {
        if (!quotedMessage || !quotedMessage.key) {
            throw new Error('Mensagem inválida para citação');
        }
        
        return await sock.sendMessage(jid, {
            text: text,
            quoted: quotedMessage
        });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem citada:', error.message);
        
        try {
            return await sock.sendMessage(jid, { text });
        } catch (fallbackError) {
            console.error('❌ Erro no fallback de mensagem:', fallbackError.message);
            throw fallbackError;
        }
    }
}

module.exports = {
    sendQuotedReply
};

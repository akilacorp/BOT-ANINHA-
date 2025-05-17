const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const axios = require('axios');
const { sendQuotedReply } = require('./lib/message-helper');
const { shouldSendSticker, identifyCategory, sendSticker } = require('./lib/sticker-helper');
const { cleanStaleSessions, backupCredentials } = require('./lib/session-manager');

const config = {
    botName: 'Aninha',
    apiUrl: 'http://localhost:3000/api', 
    responseDelay: {
        min: 1000,  
        max: 3500
    },
    authDir: path.join(__dirname, 'auth_info_baileys'),
    defaultPersona: 'aninha',  
    enableStickers: true,      
    stickerProbability: 0.20  
};


if (!fs.existsSync(config.authDir)) {
    fs.mkdirSync(config.authDir, { recursive: true });
}

class PersonalityAPIClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.availablePersonas = [];
        this.fetchAvailablePersonas();
    }

    async fetchAvailablePersonas() {
        try {
            const response = await axios.get(`${this.baseUrl}/personas`);
            if (response.data && response.data.success) {
                this.availablePersonas = response.data.personas;
                console.log(`✅ Personalidades disponíveis: ${this.availablePersonas.join(', ')}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao buscar personalidades: ${error.message}`);
        }
    }    /**
     * @param {string} message 
     * @param {string} persona 
     * @param {string} chatId 
     * @returns {Promise<object>}
     */
    async getResponse(message, persona = 'aninha', chatId = null) {
        try {
            console.log(`🔄 Enviando mensagem para API (${persona}): "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"${chatId ? ` (Chat: ${chatId})` : ''}`);
            

            const maxRetries = 2;
            let attempt = 0;
            let lastError = null;
              while (attempt < maxRetries) {
                try {
                    const response = await axios.post(`${this.baseUrl}/respond`, {
                        message: message,
                        persona: persona,
                        chatId: chatId
                    }, {
                        timeout: 30000
                    });
                      if (response.data && response.data.success) {
                        console.log(`✅ Resposta recebida para ${persona}. Sentimento: ${response.data.sentiment || 'desconhecido'}`);
                        return {
                            text: response.data.response,
                            sentiment: response.data.sentiment || 'neutral',
                            sentiment_score: response.data.sentiment_score || 0
                        };
                    } else {
                        console.warn(`⚠️ Resposta da API mal-formatada:`, response.data);
                        
                        if (response.data && response.data.fallbackResponse) {
                            return {
                                text: response.data.fallbackResponse,
                                sentiment: 'neutral',
                                sentiment_score: 0
                            };
                        }
                        
                        throw new Error('Resposta da API mal-formatada');
                    }                } catch (error) {                    lastError = error;
                    attempt++;
                    
                    console.error(`❌ Tentativa ${attempt}/${maxRetries} falhou: ${error.message}`);
                    
                    if (error.response) {
                        console.error(`Código de status: ${error.response.status}`);
                        console.error(`Dados: ${JSON.stringify(error.response.data || {}).substring(0, 200)}`);
                    }
                    
                    if (attempt < maxRetries) {
                        const waitTime = 1000 * Math.pow(2, attempt);
                        console.log(`🔄 Aguardando ${waitTime}ms antes da próxima tentativa...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }            }            
            console.error(`❌ Todas as tentativas falharam. Último erro: ${lastError.message}`);
            
            if (lastError.response && lastError.response.status === 404) {
                console.warn(`⚠️ Personalidade não encontrada. Usando resposta padrão.`);
                return "Oi! Tô com um problema técnico hoje... fala comigo depois?";
            }
            
            return this._getDefaultResponse();
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message;            console.error(`❌ Erro ao consultar a API: ${errorMessage}`);
            
            if ((error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') && !message._retried) {
                console.log(`🔄 Tentando novamente após erro de conexão...`);
                message._retried = true;
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.getResponse(message, persona);
            }
            
            return this._getDefaultResponse();
        }
    }

    /**
     * @returns {Promise<boolean>} 
     */
    async checkStatus() {
        try {
            const response = await axios.get(`${this.baseUrl}/status`);
            return response.data && response.data.success && response.data.status === 'online';
        } catch (error) {
            console.error(`❌ Erro ao verificar status da API: ${error.message}`);
            return false;
        }
    }


      @private

    _getDefaultResponse() {
        const defaultResponses = [
            "Desculpe, estou com problemas para pensar agora... 🤔",
            "Hmm, algo deu errado na minha conexão. Pode repetir depois? 😅",
            "Opa, tive um probleminha técnico. Voltarei logo! 🔄",
            "Nossa, meu cérebro deu um bug! Pode tentar de novo? 🤖"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}


const apiClient = new PersonalityAPIClient(config.apiUrl);

async function startWhatsAppBot() {
 
    console.log('🔄 Iniciando limpeza de sessões obsoletas...');
    const cleanResult = cleanStaleSessions();
    console.log(`✅ Limpeza de sessões concluída: ${cleanResult.removedCount || 0} sessões removidas`);
    
   
    backupCredentials();

   
    console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   █████╗ ███╗   ██╗██╗███╗   ██╗██╗  ██╗ █████╗     ██╗ █████╗       ║
║  ██╔══██╗████╗  ██║██║████╗  ██║██║  ██║██╔══██╗    ██║██╔══██╗      ║
║  ███████║██╔██╗ ██║██║██╔██╗ ██║███████║███████║    ██║███████║      ║
║  ██╔══██║██║╚██╗██║██║██║╚██╗██║██╔══██║██╔══██║    ██║██╔══██║      ║
║  ██║  ██║██║ ╚████║██║██║ ╚████║██║  ██║██║  ██║    ██║██║  ██║      ║
║  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝╚═╝  ╚═╝      ║
║                                                                       ║
║        Bot de WhatsApp com Personalidade via OpenRouter.ai           ║
╚═══════════════════════════════════════════════════════════════════════╝
`);

    console.log('🚀 Iniciando o bot Aninha (Modo IA via OpenRouter)...');
    
   
    const apiStatus = await apiClient.checkStatus();
    if (apiStatus) {
        console.log('✅ API de IA está online e respondendo!');
    } else {
        console.warn('⚠️ API de IA não está respondendo. O bot usará respostas padrão.');
    }
    
 
    const { state, saveCreds } = await useMultiFileAuthState(config.authDir);    const logger = pino({ 
        level: 'silent',
        transport: {
            target: 'pino/file',
            options: { destination: path.join(__dirname, 'logs', 'baileys.log') }
        }
    });


    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: [config.botName, 'Chrome', '1.0.0'],
        logger: logger,
        keepAliveIntervalMs: 10000,
        retryRequestDelayMs: 2000,
        connectTimeoutMs: 60000,
        emitOwnEvents: false,
        markOnlineOnConnect: true,
        fireInitQueries: true
    });
    sock.ev.on('creds.update', saveCreds);
    
    process.on('unhandledRejection', (reason) => {
        if (reason && reason.toString().includes('Closing stale open session')) {
            return;
        }
        console.error('Erro não tratado:', reason);
    });
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('🔄 QR Code gerado. Escaneie com seu WhatsApp para conectar!');
            console.log('➡️ Se o QR Code não for escaneado em 20 segundos, um novo será gerado.');
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom) && 
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                
            console.log(`❌ Conexão fechada devido a ${lastDisconnect?.error?.message || 'erro desconhecido'}`);
            
            if (shouldReconnect) {
                console.log('🔄 Reconectando...');
                setTimeout(startWhatsAppBot, 3000);
            } else {
                console.log('🚫 Conexão encerrada permanentemente. O bot foi desconectado.');
                process.exit(0);
            }
        } else if (connection === 'open') {
            console.log(`✅ ${config.botName} está conectada ao WhatsApp!`);
        }
    });
    
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        try {
            const message = messages[0];
            
            if (!message || !message.message || message.key.fromMe) return;
            
            const isGroup = message.key.remoteJid.endsWith('@g.us');
            
            const chatId = message.key.remoteJid;
            
            const sender = message.key.participant || message.key.remoteJid;
            const senderName = message.pushName || 'Desconhecido';
            
            let msgText = '';
            const messageType = Object.keys(message.message)[0];
            
            if (messageType === 'conversation') {
                msgText = message.message.conversation;
            } else if (messageType === 'extendedTextMessage') {
                msgText = message.message.extendedTextMessage.text;
            } else if (messageType === 'imageMessage' && message.message.imageMessage.caption) {
                msgText = message.message.imageMessage.caption;
            } else if (messageType === 'videoMessage' && message.message.videoMessage.caption) {
                msgText = message.message.videoMessage.caption;
            } else {
                return;
            }
            
            if (!isGroup) {
                console.log(`🚫 IGNORANDO mensagem privada de: ${senderName} (${chatId})`);
                console.log(`📝 Conteúdo ignorado: "${msgText.substring(0, 50)}${msgText.length > 50 ? '...' : ''}"`);
                return;
            }
            
            let shouldRespond = false;
            let personaToUse = config.defaultPersona;
            
            const isReplyToBot = !!(
                message.message.extendedTextMessage && 
                message.message.extendedTextMessage.contextInfo && 
                message.message.extendedTextMessage.contextInfo.participant && 
                message.message.extendedTextMessage.contextInfo.participant.includes(sock.user.id.split(':')[0])
            );
              const mentionsBot = !!(
                message.message.extendedTextMessage && 
                message.message.extendedTextMessage.contextInfo && 
                message.message.extendedTextMessage.contextInfo.mentionedJid && 
                message.message.extendedTextMessage.contextInfo.mentionedJid.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net')
            ) || msgText.toLowerCase().includes(config.botName.toLowerCase());
            
            shouldRespond = isReplyToBot || mentionsBot;
            
            if (!shouldRespond && Math.random() < 0.08) {
                shouldRespond = true;
                console.log(`🎲 Respondendo aleatoriamente em grupo`);
            }
            
            personaToUse = config.defaultPersona;
            
            if (shouldRespond) {
                const typingOnMessage = {
                    ephemeralMessage: {
                        message: {
                            protocolMessage: {
                                type: 1,
                                key: {
                                    remoteJid: chatId,
                                    fromMe: true
                                }
                            }
                        }
                    }
                };
                
                try {
                    await sock.presenceSubscribe(chatId);
                    await sock.sendPresenceUpdate('composing', chatId);
                } catch (e) {
                    console.error('Erro ao enviar status de digitação:', e);
                }
                
                apiClient.getResponse(msgText, personaToUse, chatId).then(async response => {
                    if (response) {
                        const ResponseHumanizer = require('./lib/response-humanizer');
                        
                        const responseText = typeof response === 'object' ? response.text : response;
                        const sentiment = typeof response === 'object' ? response.sentiment : 'neutral';
                        
                        console.log(`💭 Sentimento detectado: ${sentiment}`);
                        
                        const humanizedResponse = ResponseHumanizer.humanizeResponse(responseText);
                        
                        if (config.enableStickers && shouldSendSticker(msgText)) {
                            const category = identifyCategory(msgText);
                            console.log(`🎭 Tentando enviar sticker da categoria: ${category}`);
                            
                            const stickerSent = await sendSticker(sock, chatId, message, category);
                            
                            if (!stickerSent) {
                                await sock.sendMessage(chatId, { text: humanizedResponse }, { quoted: message });
                                console.log(`💬 [${config.botName}]: ${humanizedResponse}`);
                            }
                        } else {
                            await sock.sendMessage(chatId, { text: humanizedResponse }, { quoted: message });
                            console.log(`💬 [${config.botName}]: ${humanizedResponse} (sentimento: ${sentiment})`);
                        }
                    }
                }).catch(error => {
                    console.error('❌ Erro ao obter resposta da API:', error);
                    sock.sendPresenceUpdate('paused', chatId);
                });
            }
        } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
        }
    });
    
    return sock;
}

startWhatsAppBot().catch((err) => {
    console.error('❌ Erro inesperado:', err);
    process.exit(1);
});

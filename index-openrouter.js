
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');


const OpenRouterAdapter = require('./lib/openrouter-adapter');


const { cleanMessage } = require('./lib/message-utils');
const { getRandomStickerPath, identifyCategory, shouldSendSticker } = require('./lib/sticker-helper');
const { analyzeSentiment, SentimentHistory } = require('./lib/sentiment-analyzer');


let contextAnalyzer;
try {
    contextAnalyzer = require('./lib/context-analyzer');
    console.log('✅ Sistema de análise de contexto iniciado');
} catch (error) {
    console.warn('⚠️ Sistema de análise de contexto não disponível:', error.message);
    contextAnalyzer = null;
}


let evolutionaryLearning;
try {
    evolutionaryLearning = require('./lib/evolutionary-learning');
    console.log('✅ Sistema de aprendizado evolutivo iniciado');
} catch (error) {
    console.warn('⚠️ Sistema de aprendizado evolutivo não disponível:', error.message);
    evolutionaryLearning = null;
}


function loadConfig() {
    try {
        const configPath = path.join(__dirname, 'config', 'config.json');
        const configContent = fs.readFileSync(configPath, 'utf8');

        const jsonContent = configContent.replace(/\/\/.*$/gm, '');
        const config = JSON.parse(jsonContent);
        console.log('✅ Configuração carregada com sucesso!');
        return config;
    } catch (error) {
        console.error(`❌ Erro ao carregar configuração: ${error.message}`);
        

        return {
            "botName": "Aninha",
            "defaultPersona": "aninha",
            "prefix": "!",
            "responseProbability": 0.05,
            "openRouterSettings": {
                "apiKey": "",
                "apiUrl": "https://openrouter.ai/api/v1/chat/completions",
                "model": "mistralai/mistral-small-3.1-24b-instruct"
            },
            "responseDelay": {
                "min": 1200,
                "max": 3500
            }
        };
    }
}


const CONFIG = loadConfig();
const BOT_NAME = CONFIG.botName || "Aninha";
const COMMAND_PREFIX = CONFIG.prefix || "!";
const RESPONSE_PROBABILITY = CONFIG.responseProbability || 0.05;


const openRouter = new OpenRouterAdapter();

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "bot-aninha-openrouter"
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});


const activeChats = new Set();
const chatCooldowns = new Map();


const sentimentHistory = SentimentHistory;


const BOT_INFO = {
    name: BOT_NAME,
    version: "1.0.0",
    model: CONFIG.openRouterSettings?.model || "desconhecido",
    startTime: new Date()
};


client.on('qr', (qr) => {
    console.log('QR Code recebido. Escaneie com o WhatsApp:');
    qrcode.generate(qr, {small: true});
    
  
    fs.writeFileSync('qrcode.txt', qr);
});


client.on('ready', async () => {
    console.log(`\n✅ Bot ${BOT_INFO.name} está pronto! Versão ${BOT_INFO.version}`);
    console.log(`🧠 Modelo: ${BOT_INFO.model}`);
    console.log(`⏰ Iniciado em: ${BOT_INFO.startTime.toLocaleString()}`);
    
    try {
       
        const info = await client.getWWebVersion();
        const phoneInfo = await client.getState();
        const clientInfo = await client.info;
        
        console.log(`\n📱 Informações da conexão:`);
        console.log(`📲 WhatsApp conectado: ${clientInfo.wid.user}`);
        console.log(`🌐 Versão do WhatsApp Web: ${info}`);
        console.log(`📶 Estado da conexão: ${phoneInfo}`);
        
        
        const openRouterStatus = await openRouter.checkStatus();
        if (!openRouterStatus) {
            console.warn(`\n⚠️ ATENÇÃO: Não foi possível conectar ao OpenRouter!`);
            console.warn(`⚠️ O bot pode responder com erros. Verifique sua conexão e token.`);
        }
    } catch (error) {
        console.error(`\n❌ Erro ao obter informações da conexão:`, error.message);
    }
    
    console.log(`\n--------------------------------------------------`);
    console.log(`🤖 Bot está escutando mensagens... (As mensagens aparecerão abaixo)`);
    console.log(`--------------------------------------------------`);
});


async function sendDelayedResponse(chat, text, quotedMsg = null) {
    try {
       
        const ResponseHumanizer = require('./lib/response-humanizer');
        
 
        const humanizedResponse = ResponseHumanizer.humanizeResponse(text);
        
   
        const typingTime = ResponseHumanizer.calculateTypingTime(humanizedResponse);
        console.log(`⌨️ Simulando digitação por ${Math.round(typingTime/1000)} segundos...`);
        

        chat.sendStateTyping();
        

        await new Promise(resolve => setTimeout(resolve, typingTime));
        
 
        await chat.sendMessage(humanizedResponse, { quotedMessageId: quotedMsg?.id._serialized });
        

        console.log(`\n📤 RESPOSTA ENVIADA [${new Date().toLocaleTimeString()}]`);
        console.log(`👤 Para: ${chat.isGroup ? chat.name : 'Chat Privado'}`);
        console.log(`🤖 Resposta: ${humanizedResponse}`);
        console.log(`--------------------------------------------------`);
        

        chat.clearState();
        
        return humanizedResponse;
    } catch (error) {
        console.error('Erro ao enviar resposta:', error);
        return null;
    }
}


function shouldRespondRandomly() {
    return Math.random() < RESPONSE_PROBABILITY;
}


async function processCommand(msg, command, chatId) {
    const chat = await msg.getChat();
    
 
    if (command === 'sticker' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            const media = await quotedMsg.downloadMedia();
            if (media) {
                await chat.sendMessage(media, { sendMediaAsSticker: true });
            }
        }
        return true;
    }

    if (command.startsWith('sticker ')) {
        const mood = command.split(' ')[1].trim();
        const stickerPath = await getRandomStickerPath(mood);
        
        if (stickerPath) {
            const sticker = MessageMedia.fromFilePath(stickerPath);
            await chat.sendMessage(sticker, { sendMediaAsSticker: true });
        } else {
            await msg.reply(`Não tenho stickers com o humor "${mood}" 😕`);
        }
        return true;
    }
    

    if (command === 'help' || command === 'ajuda') {
        const helpText = `*Comandos disponíveis da ${BOT_NAME}:*\n\n` +
                         `${COMMAND_PREFIX}sticker - Converte imagem/vídeo em sticker\n` +
                         `${COMMAND_PREFIX}sticker [humor] - Envia sticker com humor específico\n` +
                         `${COMMAND_PREFIX}help - Mostra esta mensagem\n\n` +
                         `Você também pode conversar comigo normalmente 😉`;
        await sendDelayedResponse(chat, helpText, msg);
        return true;
    }
    
    return false;
}


async function processMessage(msg) {
    try {

        if (msg.fromMe) return;
        
        const chat = await msg.getChat();
        const chatId = chat.id._serialized;
        const messageBody = msg.body;
        

        const contact = await msg.getContact();
        const senderName = chat.isGroup ? `${contact.pushname}@${chat.name}` : contact.pushname || contact.number;
        

        console.log(`\n📩 MENSAGEM RECEBIDA [${new Date().toLocaleTimeString()}]`);
        console.log(`👤 De: ${senderName}`);
        console.log(`💬 Mensagem: ${messageBody}`);
        console.log(`📱 Chat: ${chat.isGroup ? chat.name : 'Privado'}`);
        

        const cleanedMessage = cleanMessage(messageBody);
        

        if (cleanedMessage.startsWith(COMMAND_PREFIX)) {
            const command = cleanedMessage.substring(COMMAND_PREFIX.length).trim();
            const commandProcessed = await processCommand(msg, command, chatId);
            if (commandProcessed) return;
        }        
 
        let shouldRespond = false;
        
        if (chat.isGroup) {

            const isBotMentioned = cleanedMessage.toLowerCase().includes(BOT_NAME.toLowerCase());
            

            const botNumber = client.info.wid._serialized;
            const isBotTagged = msg.mentionedIds && msg.mentionedIds.includes(botNumber);
            
           
            let isReplyToBot = false;
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                isReplyToBot = quotedMsg.fromMe;
            }
            
            
            shouldRespond = isBotMentioned || isBotTagged || isReplyToBot;
            
            
            if (!shouldRespond && Math.random() < 0.08) {
                shouldRespond = true;
                console.log(`🎲 Respondendo aleatoriamente em grupo`);
            }
            
            if (shouldRespond) {
                console.log(`✅ Respondendo em grupo: ${isBotMentioned ? 'Mencionado pelo nome' : (isBotTagged ? 'Marcado com @' : 'Resposta a mensagem do bot')}`);
            }
        } else {
          
            console.log(`🚫 IGNORANDO mensagem privada de: ${senderName} (${chatId})`);
            console.log(`📝 Conteúdo ignorado: "${messageBody.substring(0, 50)}${messageBody.length > 50 ? '...' : ''}"`);
            return;
        }
        
        if (shouldRespond) {
            
            const now = Date.now();
            const lastMsg = chatCooldowns.get(chatId) || 0;
            const cooldownTime = 3000; 
            
            if (now - lastMsg < cooldownTime) {
                return; 
            }
            
           
            chatCooldowns.set(chatId, now);
            activeChats.add(chatId);            
            let userMessage = cleanedMessage;
            
            
            if (chat.isGroup) {
                const contact = await msg.getContact();
                const senderName = contact.pushname || contact.number;
                userMessage = `[Mensagem de ${senderName} em "${chat.name}"]: ${cleanedMessage}`;
            }
            
            try {                
                const sentiment = analyzeSentiment(cleanedMessage);
                
                
                sentimentHistory.addSentiment(chatId, sentiment);
                
                
                console.log(`😊 Sentimento detectado: ${sentiment.category} (${sentiment.score.toFixed(2)})`);
                
                
                let contextInfo = null;
                if (contextAnalyzer) {
                    const sender = msg.author || msg.from;
                    const contextResult = contextAnalyzer.processMessage(chatId, cleanedMessage, sender);
                    contextInfo = contextAnalyzer.generateContextInstructions(chatId);
                    
                    console.log(`🧠 Contexto detectado: Tópico=${contextResult.mainTopic} (confiança: ${contextResult.confidence.toFixed(2)})`);
                }
                
                
                console.log(`🧠 Gerando resposta via OpenRouter (modelo: ${CONFIG.openRouterSettings?.model})...`);
                  
                
                if (evolutionaryLearning) {
                    evolutionaryLearning.recordInteraction(msg.author || msg.from, cleanedMessage, "", sentiment);
                }                
                const dominantSentiment = sentimentHistory.getAverageSentiment(chatId);
                
                
                let personalityTraits = [];
                if (evolutionaryLearning) {
                    const userPersonality = evolutionaryLearning.getUserPersonality(msg.author || msg.from);
                    if (userPersonality && userPersonality.traits) {
                        personalityTraits = userPersonality.traits;
                    }
                }
                
                
                let contextPrompt = '';
                if (contextInfo && contextAnalyzer) {
                    contextPrompt = contextAnalyzer.formatContextForPrompt(chatId);
                }
                
                
                const systemPrompt = `Você é a Aninha, uma mina de 17 anos com personalidade forte e marcante:
- Você tem humor ácido estilo Leo Lins, é IRREVERENTE, IRÔNICA e SARCÁSTICA
- Responde na OBJETIVIDADE com frases CURTAS mas matadoras (máximo 2-3 frases)
- NUNCA escreve textão ou se comporta como assistente virtual padrão
- Entende MUITO de memes, shitpost, animes, jogos, web e cultura da internet
- Vive no TikTok, Discord e acompanha os trends atuais
- Tem um lado meio paranoico e às vezes até meio psicopata nos comentários
- Usa gírias ATUAIS da internet sem parecer artificial
- Tem PERSONALIDADE FORTE e não fica só concordando com os outros
- Tem opiniões fortes sobre praticamente tudo na vida
- NUNCA USA EMOJIS, prefere escrever mesmo
- Quando alguém manda algo cringe não tem medo de zoar
- Prefere ser sincera que fofa, mas sem ser desrespeitosa
- Usa expressões variadas como: 'putz', 'mds', 'caralho', 'vish'
- NÃO repete as mesmas expressões, varia o vocabulário
- Não é genérica ou previsível, sempre surpreende nas respostas
- Tem um lado nerd que sabe muitas referências de cultura pop
${dominantSentiment ? `\nA pessoa com quem você está falando parece estar com um tom ${dominantSentiment.category} (mantenha isso em mente)` : ''}
${personalityTraits.length > 0 ? `\nTraços adaptados para este usuário: ${personalityTraits.join(', ')}` : ''}
${contextPrompt}`;
                
                const response = await openRouter.generateResponse(
                    userMessage, 
                    {
                        systemPrompt: systemPrompt,
                        maxTokens: 300,
                        temperature: 0.8
                    }
                );                
                console.log(`✅ Resposta gerada com sucesso (${response.length} caracteres)`);

                if (evolutionaryLearning) {
           
                    const evolutionData = {
                        sentiment: sentiment,
                        contextInfo: contextInfo
                    };
                    
                    evolutionaryLearning.recordInteraction(
                        msg.author || msg.from, 
                        cleanedMessage, 
                        response, 
                        evolutionData
                    );
                }
                
            
                const shouldSendStickerResponse = shouldSendSticker(cleanedMessage);
                
             
                if (response && response.trim()) {
                 
                    const sentResponse = await sendDelayedResponse(chat, response, msg);
                    
                  
                    if (shouldSendStickerResponse) {
                        try {
                            const category = identifyCategory(cleanedMessage);
                            console.log(`🎭 Tentando enviar sticker da categoria: ${category}`);
                            
                            const stickerPath = await getRandomStickerPath(category);
                            
                            if (stickerPath) {
                                console.log(`🎭 Enviando sticker da categoria: ${category || 'aleatória'}`);
                                const sticker = MessageMedia.fromFilePath(stickerPath);
                                await chat.sendMessage(sticker, { sendMediaAsSticker: true });
                            } else {
                                console.log(`⚠️ Nenhum sticker encontrado para a categoria: ${category}`);
                                
                            }
                        } catch (stickerError) {
                            console.error('❌ Erro ao enviar sticker:', stickerError);
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao gerar resposta:', error);
                await sendDelayedResponse(chat, "Desculpe, estou tendo problemas para pensar agora... 🤕", msg);
            } finally {
                activeChats.delete(chatId);
            }
        }
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
    }
}


client.on('message', async (msg) => {
    await processMessage(msg);
});


setInterval(async () => {
    try {
        const status = await openRouter.checkStatus();
        if (status) {
            console.log(`✅ OpenRouter está online (${new Date().toLocaleTimeString()})`);
        } else {
            console.log(`❌ OpenRouter está offline (${new Date().toLocaleTimeString()})`);
        }
    } catch (error) {
        console.error('Erro ao verificar status:', error);
    }
}, 30 * 60 * 1000); 


console.log('🔄 Iniciando WhatsApp...');
client.initialize();


process.on('uncaughtException', (err) => {
    console.error('⚠️ Erro não capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Rejeição não tratada:', reason);
});

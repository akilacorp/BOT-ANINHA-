
console.log('🤖 Iniciando teste do bot Aninha...');


function loadConfig() {
    try {
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, 'config', 'config.json');
        const configContent = fs.readFileSync(configPath, 'utf8');
       
        const jsonContent = configContent.replace(/\/\/.*$/gm, '');
        const config = JSON.parse(jsonContent);
        console.log('✅ Configuração carregada com sucesso!');
        return config;
    } catch (error) {
        console.error(`❌ Erro ao carregar configuração: ${error.message}`);
        process.exit(1);
    }
}


try {
    console.log('📚 Testando carregamento de módulos...');
    
 
    const OpenRouterAdapter = require('./lib/openrouter-adapter');
    console.log('✅ OpenRouterAdapter carregado');
    
   
    const { cleanMessage } = require('./lib/message-utils');
    console.log('✅ message-utils carregado');
    
    const { getRandomStickerPath } = require('./lib/sticker-helper');
    console.log('✅ sticker-helper carregado');
    
    const { analyzeSentiment, SentimentHistory } = require('./lib/sentiment-analyzer');
    console.log('✅ sentiment-analyzer carregado');
    
  
    const evolutionaryLearning = require('./lib/evolutionary-learning');
    console.log('✅ evolutionary-learning carregado');
    
    
    const config = loadConfig();
    console.log('📝 Configuração: ', JSON.stringify(config, null, 2));
    
    console.log('\n🎉 Todos os testes concluídos com sucesso!');
} catch (error) {
    console.error(`\n❌ Erro durante os testes: ${error.message}`);
    console.error(error.stack);
}

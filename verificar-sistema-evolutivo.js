console.log('🧠 Verificando Sistema de Aprendizado Evolutivo...\n');

try {
    
    const evolutionaryLearning = require('./lib/evolutionary-learning');
    console.log('✅ Módulo carregado com sucesso');
    
    
    const isReady = evolutionaryLearning.isSystemReady();
    console.log(`🔍 Sistema pronto: ${isReady ? 'SIM' : 'NÃO'}`);
    
    
    const stats = evolutionaryLearning.getStatistics();
    console.log('\n📊 ESTATÍSTICAS:');
    console.log(`👥 Usuários no sistema: ${stats.users}`);
    console.log(`🔄 Total de adaptações: ${stats.totalAdaptations}`);
    console.log(`📝 Versões de personalidade: ${stats.personalityVersions}`);
    console.log(`📋 Traços base: ${stats.baseTraits}`);
    console.log(`⏰ Última atualização: ${new Date(stats.lastUpdate).toLocaleString()}`);
    
    
    const fs = require('fs');
    const path = require('path');
    const memoryDbPath = path.join(__dirname, 'data', 'memory-db.json');
    
    if (fs.existsSync(memoryDbPath)) {
        const memoryDb = JSON.parse(fs.readFileSync(memoryDbPath, 'utf8'));
        const userCount = Object.keys(memoryDb.users).length;
        
        console.log(`\n📚 BANCO DE DADOS DE MEMÓRIA:`);
        console.log(`👥 Total de usuários: ${userCount}`);
        
        if (memoryDb.evolutionStats) {
            console.log(`🔄 Total de adaptações registradas: ${memoryDb.evolutionStats.totalAdaptations}`);
            console.log(`📝 Personalidade evoluída ${memoryDb.evolutionStats.personalityVersions.length} vezes`);
            console.log(`⏰ Última evolução: ${new Date(memoryDb.evolutionStats.lastUpdate).toLocaleString()}`);
        }
        
        
        const userSample = Object.keys(memoryDb.users).slice(0, 3);
        if (userSample.length > 0) {
            console.log(`\n👤 AMOSTRA DE USUÁRIOS:`);
            for (const userId of userSample) {
                const user = memoryDb.users[userId];
                console.log(`- ${userId.substring(0, 20)}... (${user.interactions ? user.interactions.length : 0} interações)`);
            }
        }
    } else {
        console.log(`\n❌ Arquivo de banco de dados não encontrado: ${memoryDbPath}`);
    }
    
    console.log('\n✅ Verificação concluída com sucesso!');
} catch (error) {
    console.error(`\n❌ ERRO AO VERIFICAR SISTEMA EVOLUTIVO:`);
    console.error(error);
}

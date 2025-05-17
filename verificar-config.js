
const fs = require('fs');
const path = require('path');

try {
    const configPath = path.join(__dirname, 'config', 'config.json');
    console.log('Lendo arquivo de configuração...');
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    console.log('Conteúdo do arquivo:');
    console.log(configContent);
    
    console.log('\nTentando fazer o parse do JSON...');
    const config = JSON.parse(configContent);
    
    console.log('\n✅ Configuração carregada com sucesso!');
    console.log(JSON.stringify(config, null, 2));
} catch (error) {
    console.error(`\n❌ Erro ao carregar configuração: ${error.message}`);
    if (error.position) {
        console.error(`Posição do erro: ${error.position}`);
    }
}

console.log('\nVerificação concluída!');

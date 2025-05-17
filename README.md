# ANINHA BOT INTERATIVA - WhatsApp

<div align="center">
  <img src="https://i.ibb.co/PZMs7K3C/photo-2025-05-17-04-46-44.jpg" alt="Aninha Bot" width="300"/>
  <br>
  <h3>Bot de conversação inteligente para WhatsApp desenvolvido com tecnologia avançada de IA</h3>
</div>

## 📋 Índice

- [Descrição](#-descrição)
- [Recursos](#-recursos)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Personalização](#-personalização)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Créditos](#-créditos)
- [Contato](#-contato)

## 📝 Descrição

Aninha Bot é um chatbot interativo para WhatsApp que simula conversas humanas de forma natural e envolvente. Utilizando algoritmos avançados de processamento de linguagem natural, o bot pode manter conversas fluidas, responder a perguntas, enviar figurinhas e se adaptar ao estilo de comunicação do usuário.

O diferencial da Aninha é sua capacidade de evolução com base nas interações com os usuários, aprendendo e melhorando suas respostas com o tempo. Além disso, o bot conta com um sistema avançado de "humanização" das respostas, incluindo gírias, pequenas imperfeições textuais e expressões que tornam a conversa muito mais natural.

## 🚀 Recursos

- **Conversação Natural**: Respostas humanizadas que imitam o estilo de escrita de uma pessoa real
- **Análise de Sentimentos**: Capacidade de detectar emoções e adaptar respostas
- **Sistema Evolutivo**: Aprende e se adapta com base nas interações anteriores
- **Stickers Contextuais**: Envio de figurinhas baseadas no contexto da conversa
- **Memória de Conversas**: Lembrança de conversas anteriores para manter o contexto
- **Personalidade Flexível**: Facilmente configurável para diferentes personalidades
- **Suporte a Grupos**: Funciona tanto em conversas individuais quanto em grupos

## 📋 Requisitos

- Node.js (versão 16.x ou superior)
- NPM (versão 8.x ou superior)
- Uma conta no WhatsApp
- API Key da OpenRouter (para acesso ao modelo de IA)
- Conexão estável com a internet

## 💻 Instalação

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/aninha-bot.git
cd aninha-bot
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Instale os pacotes necessários:**

```bash
npm install whatsapp-web.js qrcode-terminal openai fs path express
```

## ⚙️ Configuração

### Configurando a API da OpenRouter

1. Crie uma conta em [OpenRouter](https://openrouter.ai/)
2. Gere uma API Key no painel de controle
3. Abra o arquivo `config/config.json`
4. Substitua o valor de `apiKey` pela sua chave pessoal:

```json
"openRouterSettings": {
  "apiKey": "sua-api-key-aqui",
  "apiUrl": "https://openrouter.ai/api/v1/chat/completions",
  "model": "mistralai/mistral-small-3.1-24b-instruct"
}
```

### Configurando a personalidade do bot

O comportamento da Aninha é definido pelo arquivo `personas/aninha.json`. Você pode modificar este arquivo para alterar:

- Estilo de conversa
- Conhecimentos e interesses
- Tom de voz
- Forma de responder
- Uso de gírias e expressões

Exemplo de personalização:

```json
{
  "name": "Aninha",
  "age": 19,
  "personality": "extrovertida, bem-humorada e um pouco irônica",
  "interests": ["música pop", "redes sociais", "memes", "filmes de terror"],
  "languageStyle": "informal, usa gírias e abreviações, às vezes comete pequenos erros de digitação"
}
```

### Configurações gerais do bot

No arquivo `config/config.json` você pode configurar:

- **botName**: Nome do bot (padrão: "Aninha")
- **defaultPersona**: Personalidade padrão a ser carregada (padrão: "aninha")
- **prefix**: Prefixo de comando para acionar o bot diretamente (padrão: "!")
- **responseProbability**: Probabilidade do bot responder mensagens sem ser chamado diretamente (0-1)
- **responseDelay**: Intervalo de tempo para simular a digitação (em milissegundos)

## 🎮 Uso

### Iniciando o bot

1. Execute o comando para iniciar o bot:

```bash
node index-ai.js
```

Ou, se preferir, use os scripts de inicialização:

```bash
# Para iniciar em modo normal
./INICIAR-BOT.CMD

# Para iniciar em modo de depuração
./INICIAR-BOT-DEBUG.CMD
```

2. Escaneie o código QR que aparecerá no terminal com seu WhatsApp
3. Após escanear, o bot estará conectado e pronto para uso

### Comandos disponíveis

- `!help` - Exibe a lista de comandos disponíveis
- `!sticker` - Transforma uma imagem em figurinha (envie o comando como legenda de uma imagem)
- `!diagnostico` - Gera um diagnóstico do sistema do bot
- `!reset` - Reinicia a conversa atual

## 📁 Estrutura do Projeto

- `index-ai.js` - Arquivo principal do bot
- `config/` - Arquivos de configuração
- `lib/` - Bibliotecas e módulos do sistema
  - `context-analyzer.js` - Análise de contexto das mensagens
  - `conversation-history.js` - Gerenciamento do histórico de conversas
  - `evolutionary-learning.js` - Sistema de aprendizado evolutivo
  - `message-helper.js` - Funções de auxílio para processamento de mensagens
  - `response-humanizer.js` - Humanização das respostas (gírias, imperfeições)
  - `sentiment-analyzer.js` - Análise de sentimentos
  - `sticker-helper.js` - Geração e envio de figurinhas
- `personas/` - Definições de personalidades
- `stickers/` - Banco de figurinhas organizadas por categoria
- `data/` - Armazenamento de dados de conversas e memória

## 🏆 Créditos

Este projeto foi desenvolvido por:

- **AesCorp** - Desenvolvimento e arquitetura
- **Akila** - Conceito e coordenação

## 📞 Contato

Para mais informações, acesse nosso canal no WhatsApp:
[Canal Oficial](https://whatsapp.com/channel/0029VbB1a77545ussjB7uu1s)

---

<div align="center">
  <p>© 2025 AesCorp & Akila | ANINHA BOT INTERATIVA</p>
</div>

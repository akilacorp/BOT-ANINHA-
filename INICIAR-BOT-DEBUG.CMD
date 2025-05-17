@echo off
echo Iniciando Bot Aninha com debugging...
cd "%~dp0"
node --trace-warnings index-openrouter.js > bot-output.log 2>&1
echo Bot encerrado. Verifique o arquivo bot-output.log para detalhes.
pause

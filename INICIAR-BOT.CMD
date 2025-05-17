@echo off
title ANINHA BOT - CONSOLE DE MENSAGENS
echo.
echo ======================================
echo  BOT ANINHA COM OPENROUTER (MISTRAL)
echo ======================================
echo.
echo Iniciando o Bot Aninha com modelo Mistral Small 3.1...
echo.
echo AGUARDE: O bot precisa inicializar e conectar ao WhatsApp...
echo (Se for a primeira vez, escaneie o QR Code quando aparecer)
echo.
echo ======================================
echo.

REM Usar cores para as mensagens de log (verde=2, vermelho=4, amarelo=6)
color 0A

REM 
node index-openrouter.js

REM 
color 0C
echo.
echo ======================================
echo ERRO: O BOT FOI ENCERRADO INESPERADAMENTE
echo ======================================
echo.
echo Verifique o erro acima e tente novamente.
echo.
pause

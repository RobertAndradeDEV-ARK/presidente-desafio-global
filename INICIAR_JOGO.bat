@echo off
title PRESIDENTE: O DESAFIO GLOBAL
echo Iniciando servidor local para PRESIDENTE: O DESAFIO GLOBAL...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 4173 -OpenBrowser
pause

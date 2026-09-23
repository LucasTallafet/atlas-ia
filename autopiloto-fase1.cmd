@echo off
rem Fase 1A y 1B en modo autónomo con Opus (web base + 3 fichas piloto)
cd /d "%~dp0"
python tools\autopiloto.py --orden "Fase 1A" --orden "Fase 1B" --modelo opus >> autopiloto-consola.txt 2>&1

@echo off
rem Lanza el autopiloto con los argumentos que le pases (por ejemplo: autopiloto.cmd --hasta L04)
cd /d "%~dp0"
python tools\autopiloto.py %* >> autopiloto-consola.txt 2>&1

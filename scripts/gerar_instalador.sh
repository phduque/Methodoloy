#!/bin/sh
# Gera dist/Metodo-Logico-Instalador.exe (requer NSIS 3: apt-get install nsis).
set -e
cd "$(dirname "$0")/../windows"
mkdir -p ../dist
makensis -V2 instalador.nsi
ls -l ../dist/Metodo-Logico-Instalador.exe

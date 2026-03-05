#!/bin/bash

# Script para iniciar API-Auth en Linux/Mac

echo "======================================"
echo "  API-Auth - Sistema de Autenticacion"
echo "======================================"
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "[*] Instalando dependencias..."
    npm install
    echo ""
fi

# Verificar si .env existe
if [ ! -f ".env" ]; then
    echo "[!] ERROR: Archivo .env no encontrado"
    echo "[*] Pasos para configurar:"
    echo "    1. Copia .env.example a .env"
    echo "    2. Edita .env con tus valores:"
    echo "       - MONGO_URI (MongoDB local o Atlas)"
    echo "       - JWT_SECRET (cadena segura aleatoria)"
    echo "       - PORT (puerto, default 3000)"
    echo ""
    echo "    Ejemplo:"
    echo "    MONGO_URI=mongodb://localhost:27017/api-auth"
    echo "    JWT_SECRET=tu_secreto_super_seguro_aqui"
    echo "    PORT=3000"
    echo ""
    read -p "Presiona ENTER para salir"
    exit 1
fi

# Iniciar servidor
echo "[+] Iniciando servidor..."
echo "[+] Abre http://localhost:3000 en tu navegador"
echo ""

npm start

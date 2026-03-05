#!/usr/bin/env pwsh
# Script para iniciar API-Auth

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  API-Auth - Sistema de Autenticacion" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Instalando dependencias..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Verificar si .env existe
if (-not (Test-Path ".env")) {
    Write-Host "[!] ERROR: Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "[*] Pasos para configurar:" -ForegroundColor Yellow
    Write-Host "    1. Copia .env.example a .env"
    Write-Host "    2. Edita .env con tus valores:"
    Write-Host "       - MONGO_URI (MongoDB local o Atlas)"
    Write-Host "       - JWT_SECRET (cadena segura aleatoria)"
    Write-Host "       - PORT (puerto, default 3000)"
    Write-Host ""
    Write-Host "    Ejemplo:"
    Write-Host "    MONGO_URI=mongodb://localhost:27017/api-auth"
    Write-Host "    JWT_SECRET=tu_secreto_super_seguro_aqui"
    Write-Host "    PORT=3000"
    Write-Host ""
    Read-Host "Presiona ENTER para salir"
    exit 1
}

# Iniciar servidor
Write-Host "[+] Iniciando servidor..." -ForegroundColor Green
Write-Host "[+] Abre http://localhost:3000 en tu navegador" -ForegroundColor Green
Write-Host ""

npm start

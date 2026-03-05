#!/usr/bin/env pwsh

# Script de instalación automática para API-Auth
# Uso: .\install-and-run.ps1

Write-Host "========================================" -ForegroundColor Cyan -BackgroundColor Black
Write-Host "   API-Auth - Instalación Automática    " -ForegroundColor Cyan -BackgroundColor Black
Write-Host "========================================" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""

# Obtener directorio actual
$currentDir = Get-Location
Write-Host "[*] Directorio: $currentDir" -ForegroundColor Gray

# Verificar Node.js
Write-Host "[*] Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = & "C:\Program Files\nodejs\node.exe" --version 2>$null
if ($nodeVersion) {
    Write-Host "[✓] Node.js $nodeVersion instalado" -ForegroundColor Green
} else {
    Write-Host "[✗] Node.js no encontrado. Por favor instála desde https://nodejs.org" -ForegroundColor Red
    Read-Host "Presiona ENTER para salir"
    exit 1
}

# Verificar npm
Write-Host "[*] Verificando npm..." -ForegroundColor Yellow
$npmVersion = & "C:\Program Files\nodejs\npm.cmd" --version 2>$null
if ($npmVersion) {
    Write-Host "[✓] npm $npmVersion instalado" -ForegroundColor Green
} else {
    Write-Host "[✗] npm no encontrado" -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host ""
Write-Host "[*] Instalando dependencias del proyecto..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "[!] node_modules ya existe, saltando npm install" -ForegroundColor Gray
} else {
    & "C:\Program Files\nodejs\npm.cmd" install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[✓] Dependencias instaladas exitosamente" -ForegroundColor Green
    } else {
        Write-Host "[✗] Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
}

# Verificar .env
Write-Host ""
Write-Host "[*] Verificando archivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "[✓] Archivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "[!] Archivo .env no encontrado, creando desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[!] Edita .env con tus valores de MongoDB y JWT_SECRET" -ForegroundColor Yellow
}

# Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  [✓] Instalación completada!          " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Edita .env si es necesario (MONGO_URI, JWT_SECRET)" -ForegroundColor White
Write-Host "2. Asegúrate de que MongoDB está corriendo" -ForegroundColor White
Write-Host "3. Ejecuta: npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "El servidor estará disponible en: http://localhost:3000" -ForegroundColor Green
Write-Host ""

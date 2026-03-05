#!/usr/bin/env pwsh

# Script de instalación que funciona sin PATH

$NodePath = "C:\Program Files\nodejs"
$npmCmd = Join-Path $NodePath "npm.cmd"
$nodeCmd = Join-Path $NodePath "node.exe"

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       API-AUTH INSTALLER SCRIPT        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar Node.js
if (Test-Path $nodeCmd) {
    $version = & $nodeCmd --version
    Write-Host "[✓] Node.js $version encontrado" -ForegroundColor Green
} else {
    Write-Host "[✗] Node.js no encontrado en $NodePath" -ForegroundColor Red
    Write-Host "`nDebes instalar Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Presiona ENTER para salir"
    exit 1
}

# Instalar dependencias
if (Test-Path "node_modules") {
    Write-Host "[!] node_modules ya existe" -ForegroundColor Gray
} else {
    Write-Host "`n[*] Instalando dependencias..." -ForegroundColor Yellow
    & $npmCmd install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[✓] Dependencias instaladas" -ForegroundColor Green
    } else {
        Write-Host "[✗] Error en instalación" -ForegroundColor Red
        exit 1
    }
}

# Verificar .env
if (Test-Path ".env") {
    Write-Host "[✓] Archivo .env existe" -ForegroundColor Green
} else {
    Write-Host "[!] Creando .env desde .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    ¡INSTALACIÓN COMPLETADA! 🎉        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n[*] Próximo paso: Configurar MongoDB y ejecutar 'npm start'" -ForegroundColor Cyan
Write-Host "`n"

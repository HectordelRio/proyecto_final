@echo off
REM Script para iniciar el servidor API-Auth

echo ======================================
echo  API-Auth - Sistema de Autenticacion
echo ======================================
echo.

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo [*] Instalando dependencias...
    call npm install
    echo.
)

REM Crear .env si no existe
if not exist ".env" (
    echo [*] Archivo .env no encontrado
    echo [!] Copia .env.example a .env y configura tus valores:
    echo     - MONGO_URI (MongoDB local o Atlas)
    echo     - JWT_SECRET (cadena segura aleatoria)
    echo     - PORT (puerto, default 3000)
    echo.
    pause
    exit /b 1
)

REM Iniciar servidor
echo [+] Iniciando servidor en puerto 3000...
echo [+] Abre http://localhost:3000 en tu navegador
echo.
call npm start

pause

# Avance1 – Actividades de Cafetería (Node/Express/JWT/Mongo)

Este repositorio contiene una app con autenticación JWT y persistencia en MongoDB para gestionar **actividades** y **empleados** (asignación de actividades).

La aplicación principal está dentro de la carpeta **main/**.

## Requisitos
- Node.js (LTS recomendado)
- MongoDB local o remoto

## Instalación
```bash
cd main
npm install
```

## Variables de entorno
1. Copia el archivo de ejemplo:
```bash
cd main
copy .env.example .env
```
2. Edita `main/.env` y configura:
- `MONGO_URI` (por ejemplo `mongodb://127.0.0.1:27017/api-auth`)
- `JWT_SECRET` (cualquier string seguro)
 - `PORT` (por defecto `3000`)

## Ejecutar
En dos terminales separadas:

**Backend (API) – puerto 3000**
```bash
cd main
npm run start:backend
```

**Frontend (React + Vite)**
```bash
cd main
npm run start:frontend
```

Abre: `http://localhost:5173` (si ese puerto está ocupado, Vite elige otro automáticamente).

Nota: el dev server de Vite está configurado con proxy para `'/api'` hacia `http://localhost:3000`.

## Pruebas
```bash
cd main
npm test
```

## Endpoints
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Activities (protegido): `GET/POST/PUT/DELETE /api/activities`
- Employees (protegido): `GET/POST/PUT/DELETE /api/employees`

## Documentación
Ver [DOCUMENTACION.md](DOCUMENTACION.md)

# Documentación – Avance1 (Marzo 2026)

Este documento verifica que el proyecto incluye los puntos solicitados: mejoras backend, integración de API externa y mejoras frontend.

## 1) Mejoras en el backend

### 1.1 Autorización (JWT + roles)
- Autenticación con JWT en [main/middleware/auth.js](main/middleware/auth.js): valida `Authorization: Bearer <token>`, verifica firma (`JWT_SECRET`) y carga el usuario desde Mongo.
- Roles `admin` / `user`:
  - Middleware de roles en [main/middleware/requireRole.js](main/middleware/requireRole.js) (ej. rutas de usuarios solo para admin).
  - Permisos específicos por sección/acción:
    - Crear/eliminar actividades: solo admin en [main/controllers/activityController.js](main/controllers/activityController.js).
    - Usuario regular: solo puede actualizar `done` (y solo si la actividad es suya por creación o asignación) en [main/controllers/activityController.js](main/controllers/activityController.js).

Nota: el requisito permite “OAuth o ampliar JWT”. Aquí se cumple ampliando JWT con roles/permiso por acción.

### 1.2 Middleware de validación en rutas protegidas
- Middleware `validate()` en [main/middleware/validate.js](main/middleware/validate.js).
- Ejemplos de uso en rutas protegidas:
  - Actividades (validación de body en POST/PUT): [main/routes/activityRoutes.js](main/routes/activityRoutes.js)
  - Empleados (validación de body en POST/PUT): [main/routes/employeeRoutes.js](main/routes/employeeRoutes.js)
  - Cambio de rol de usuario (validación de body): [main/routes/userRoutes.js](main/routes/userRoutes.js)

### 1.3 CRUD con filtros y paginación (GET)
- Actividades:
  - GET con filtros `done`, `importance`, `assigneeId`, búsqueda `q` y paginación `page/limit` en [main/controllers/activityController.js](main/controllers/activityController.js).
  - Endpoint adicional para “mis asignadas”: GET `/api/activities/assigned/me` en [main/routes/activityRoutes.js](main/routes/activityRoutes.js).
- Empleados:
  - GET con búsqueda `q` y paginación `page/limit` en [main/controllers/employeeController.js](main/controllers/employeeController.js).

### 1.4 Pruebas (robustez API)
- Suite Jest + Supertest en [main/tests](main/tests):
  - Rutas y controladores de auth/activities/employees/users/external.
- Ejecución: `cd main && npm test`.

### 1.5 Middleware de errores + debugging
- Error handler JSON centralizado en [main/middleware/errorHandler.js](main/middleware/errorHandler.js) (JSON inválido, errores Mongoose, duplicados, CastError, etc.).
- Scripts de debugging con Node Inspector en [main/package.json](main/package.json):
  - `npm run start:debug`
  - `npm run start:debug:brk`

### 1.6 Paginación “con ejemplo de IA”
Se aplicó un patrón típico recomendado por herramientas de IA para Express + Mongoose:
- Parseo seguro de `page/limit`
- `skip = (page-1)*limit`
- `countDocuments()` para total
- Respuesta `{ items, page, limit, total, totalPages }`

Implementación adaptada al modelo del proyecto:
- [main/controllers/activityController.js](main/controllers/activityController.js)
- [main/controllers/employeeController.js](main/controllers/employeeController.js)

## 2) Integración de API externa

### 2.1 API seleccionada
- API pública de tipo de cambio: `https://open.er-api.com/v6/latest/<BASE>`

### 2.2 Consumo y manejo de errores
- Cliente con cache TTL y manejo de errores HTTP/JSON en [main/services/exchangeRates.js](main/services/exchangeRates.js).

### 2.3 Funcionalidad en la aplicación
- Endpoints protegidos:
  - GET `/api/external/rates?base=USD`
  - GET `/api/external/convert?from=USD&to=MXN&amount=10`
- Implementación en [main/controllers/externalController.js](main/controllers/externalController.js) y rutas en [main/routes/externalRoutes.js](main/routes/externalRoutes.js).

## 3) Mejoras en el frontend

### 3.1 Framework frontend
- Frontend React + Vite en [main/frontend-react](main/frontend-react).

### 3.2 Rutas dinámicas y navegación
- React Router con rutas protegidas y ruta dinámica:
  - `/:id` en `/activities/:id` en [main/frontend-react/src/App.jsx](main/frontend-react/src/App.jsx)
  - Guards:
    - [main/frontend-react/src/routes/RequireAuth.jsx](main/frontend-react/src/routes/RequireAuth.jsx)
    - [main/frontend-react/src/routes/RequireRole.jsx](main/frontend-react/src/routes/RequireRole.jsx)

### 3.3 Sesiones/autenticación en frontend
- Manejo de sesión JWT en localStorage + verificación con `/api/auth/me`:
  - [main/frontend-react/src/state/AuthContext.jsx](main/frontend-react/src/state/AuthContext.jsx)

### 3.4 Responsivo / UX
- CSS con layout flexible, grid adaptable y media queries:
  - [main/frontend-react/src/styles.css](main/frontend-react/src/styles.css)

### 3.5 Edición de tasks
- Admin puede editar título/importancia/hecha y reasignar usuario desde el detalle:
  - UI en [main/frontend-react/src/pages/ActivityDetail.jsx](main/frontend-react/src/pages/ActivityDetail.jsx)
  - Backend: `PUT /api/activities/:id` (admin) soporta `assigneeUserId` en [main/controllers/activityController.js](main/controllers/activityController.js)

## 4) Ejecución rápida
- Backend: `cd main && npm run start:backend`
- Frontend: `cd main && npm run start:frontend`
- Tests: `cd main && npm test`

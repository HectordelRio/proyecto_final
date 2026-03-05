const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Configuración CORS para permitir frontend local (Vite suele usar 5173+)
const corsOptions = {
  origin: [
    'http://localhost:4000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares globales
app.use(cors(corsOptions));
app.use(express.json());

// Rutas de la API
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const externalRoutes = require('./routes/externalRoutes');

// Autenticación (login, registro, /me protegido, etc.)
app.use('/api/auth', authRoutes);

// Rutas de recursos (usuarios y actividades)
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/employees', employeeRoutes);

// Integración de API externa (ej: conversión de moneda)
app.use('/api/external', externalRoutes);

// 404 JSON para cualquier ruta /api no encontrada (evita respuestas HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

// Error handler global (JSON)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.error('Error conectando a MongoDB:', err.message));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

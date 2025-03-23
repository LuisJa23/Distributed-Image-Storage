import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import visionRoutes from './routes/vision_routes';
import path from 'path';
import fs from 'fs';

// Asegurar que la carpeta uploads existe
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Rutas para la API de visión
app.use('/api/vision', visionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Google Vision funcionando correctamente',
    endpoints: {
      labels: '/api/vision/labels',
      landmark: '/api/vision/landmark'
    }
  });
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error interno del servidor',
    }
  });
});

export default app;
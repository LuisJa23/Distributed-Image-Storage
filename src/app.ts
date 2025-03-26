// src/app.ts
import express, { Application as ExpressApplication } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors'; // Importa cors
import imageRoutes from './routes/routes';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error_handler';
import { DatabaseConnection } from './config/database_config';

export class Application {
  private readonly app: ExpressApplication;

  constructor() {
    dotenv.config();
    // Inicializa la base de datos de forma asíncrona (se detendrá la app si falla)
    this.initializeDatabase();

    this.app = express();
    this.createUploadDirectory();
    this.configureMiddleware();
    this.setupRoutes();
    this.addErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await DatabaseConnection.initialize();
      logger.info('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
      logger.error('Error al conectar la base de datos:', error);
      process.exit(1);
    }
  }

  private createUploadDirectory(): void {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      logger.info(`Directorio de uploads creado: ${uploadDir}`);
    }
  }

  private configureMiddleware(): void {
    // Configura CORS para permitir solicitudes desde localhost (cualquier puerto)
    this.app.use(cors({
      origin: (origin: string | undefined, callback: (arg0: Error | null, arg1: boolean | undefined) => any) => {
        // Permitir solicitudes sin origin (por ejemplo, Postman)
        if (!origin) return callback(null, true);
        // Verifica que el origin sea localhost con o sin puerto
        if (origin.match(/^http:\/\/localhost(:\d+)?$/)) {
          return callback(null, true);
        }
        return callback(new Error('No permitido por CORS'), false);
      }
    }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      logger.info(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  private setupRoutes(): void {
    const apiRoutes = {
      vision: '/api/vision',
      storage: '/api/storage'
    };

    // Ruta raíz con información de la API
    this.app.get('/', (req, res) => {
      res.json({
        message: 'API de Imágenes funcionando correctamente',
        endpoints: {
          vision: {
            labels: `${apiRoutes.vision}/labels`,
            landmark: `${apiRoutes.vision}/landmark`
          },
          images: {
            upload: `${apiRoutes.storage}/upload`,
            delete: `${apiRoutes.storage}/:fileName`
          },
          bucket: {
            maxSpace: '/api/bucket/max-space'
          }
        }
      });
    });

    // Registra las rutas generales (notar que todas se están uniendo en un solo router)
    this.app.use('/api', imageRoutes);
  }

  private addErrorHandling(): void {
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint no encontrado' });
    });
    this.app.use(errorHandler);
  }

  public getExpressApp(): ExpressApplication {
    return this.app;
  }
}

export default Application;

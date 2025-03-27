import express, { Application as ExpressApplication } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import imageRoutes from './routes/routes';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error_handler';
import { DatabaseConnection } from './config/database_config';
import { CorsConfig } from './config/cors_config';

/**
 * Clase Application: Configura y arranca el servidor Express.
 */
export class Application {
  private readonly app: ExpressApplication;

  constructor() {
    dotenv.config();
    // Inicializa la base de datos; si falla, se detiene la app.
    this.initializeDatabase();

    this.app = express();
    // Crea el directorio para subir archivos si no existe.
    this.createUploadDirectory();
    // Configura middlewares básicos.
    this.configureMiddleware();
    // Define las rutas de la API.
    this.setupRoutes();
    // Agrega manejo de errores y rutas no encontradas.
    this.addErrorHandling();
  }

  /**
   * Inicializa la conexión a la base de datos.
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await DatabaseConnection.initialize();
      logger.info('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
      logger.error('Error al conectar la base de datos:', error);
      process.exit(1);
    }
  }

  /**
   * Crea el directorio "uploads" si aún no existe.
   */
  private createUploadDirectory(): void {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      logger.info(`Directorio de uploads creado: ${uploadDir}`);
    }
  }

  /**
   * Configura middlewares: CORS, parsers de JSON y URL-encoded, y logging de solicitudes.
   */
  private configureMiddleware(): void {
    this.app.use(CorsConfig.getCorsMiddleware());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      logger.info(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  /**
   * Define las rutas de la API.
   */
  private setupRoutes(): void {
    const apiRoutes = {
      vision: '/api/vision',
      storage: '/api/storage'
    };

    // Ruta raíz con información básica sobre la API.
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

    // Registra las rutas generales de la API.
    this.app.use('/api', imageRoutes);
  }

  /**
   * Agrega manejo de errores y rutas no encontradas.
   */
  private addErrorHandling(): void {
    // Maneja rutas no encontradas.
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint no encontrado' });
    });
    // Middleware centralizado para el manejo de errores.
    this.app.use(errorHandler);
  }

  /**
   * Retorna la instancia de la aplicación Express.
   */
  public getExpressApp(): ExpressApplication {
    return this.app;
  }
}

export default Application;

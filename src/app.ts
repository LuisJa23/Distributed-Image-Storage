import express, { Application as ExpressApplication } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import imageRoutes from './routes/routes';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error_handler';

export class Application {
  private readonly app: ExpressApplication;

  constructor() {
    // Load environment variables
    dotenv.config();

    // Initialize Express application
    this.app = express();

    // Create uploads directory
    this.createUploadDirectory();

    // Configure middleware
    this.configureMiddleware();

    // Setup routes
    this.setupRoutes();

    // Add error handling
    this.addErrorHandling();
  }

  private createUploadDirectory(): void {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      logger.info(`Created uploads directory: ${uploadDir}`);
    }
  }

  private configureMiddleware(): void {
    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });

    // JSON parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Root route with API information
    this.app.get('/', (req, res) => {
      res.json({
        message: 'API de Imágenes funcionando correctamente',
        endpoints: {
          vision: {
            labels: '/api/vision/labels',
            landmark: '/api/vision/landmark'
          },
          images: {
            upload: '/api/storage/upload',
            delete: '/api/storage/:fileName'
          }
        }
      });
    });

    // API routes
    this.app.use('/api/vision', imageRoutes);
    this.app.use('/api/storage', imageRoutes);
  }

  private addErrorHandling(): void {
    // 404 handler
    this.app.use((req, res, next) => {
      res.status(404).json({
        error: 'Endpoint not found'
      });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  public getExpressApp(): ExpressApplication {
    return this.app;
  }
}

export default Application;
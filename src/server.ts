import { createServer } from 'http';
import { Application } from './app';
import { DatabaseConnection } from './config/database_config';
import { logger } from './utils/logger';

class Server {
  private readonly app: Application;
  private readonly port: number;

  constructor() {
    this.app = new Application();
    this.port = this.normalizePort(process.env.PORT || '3030');
  }

  private normalizePort(val: string): number {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
      throw new Error('Invalid port configuration');
    }
    return port;
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseConnection.initialize();
      logger.info('Database connection established successfully');

      // Create HTTP server
      const server = createServer(this.app.getExpressApp());

      // Start server
      server.listen(this.port);
      server.on('listening', this.onListening.bind(this));
      server.on('error', this.onError.bind(this));
    } catch (error) {
      logger.error('Failed to start server', error);
      process.exit(1);
    }
  }

  private onListening(): void {
    logger.info(`🚀 Servidor corriendo en http://localhost:${this.port}`);
    logger.info(`🔍 API de visión disponible en http://localhost:${this.port}/api/vision`);
    logger.info(`📷 API de imágenes disponible en http://localhost:${this.port}/api/images`);
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof this.port === 'string'
      ? `Pipe ${this.port}`
      : `Port ${this.port}`;

    switch (error.code) {
      case 'EACCES':
        logger.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        logger.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}

// Instantiate and start the server
const server = new Server();
server.start();
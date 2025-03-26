import { createServer } from 'http';
import { Application } from './app';
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
      throw new Error('Configuración de puerto inválida');
    }
    return port;
  }

  public start(): void {
    const server = createServer(this.app.getExpressApp());
    server.listen(this.port);
    server.on('listening', this.onListening.bind(this));
    server.on('error', this.onError.bind(this));
  }

  private onListening(): void {
    logger.info(`🚀 Servidor corriendo en http://localhost:${this.port}`);
    logger.info(`Endpoint de bucket: http://localhost:${this.port}/api/bucket/max-space`);
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind = typeof this.port === 'string' ? `Pipe ${this.port}` : `Port ${this.port}`;
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

const server = new Server();
server.start();

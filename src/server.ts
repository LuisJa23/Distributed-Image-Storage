import { createServer } from 'http';
import { Application } from './app';
import { logger } from './utils/logger';

/**
 * Clase Server: Configura y arranca el servidor HTTP.
 */
class Server {
  private readonly app: Application;
  private readonly port: number;

  constructor() {
    // Inicializa la aplicación y configura el puerto (por defecto 3030).
    this.app = new Application();
    this.port = this.normalizePort(process.env.PORT || '3030');
  }

  /**
   * Normaliza el puerto de la aplicación.
   * @param val Valor del puerto.
   * @returns El puerto como número.
   * @throws Error si el valor no es un número válido.
   */
  private normalizePort(val: string): number {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
      throw new Error('Configuración de puerto inválida');
    }
    return port;
  }

  /**
   * Inicia el servidor HTTP y configura los manejadores de eventos.
   */
  public start(): void {
    const server = createServer(this.app.getExpressApp());
    server.listen(this.port);
    server.on('listening', this.onListening.bind(this));
    server.on('error', this.onError.bind(this));
  }

  /**
   * Manejador del evento 'listening'.
   * Informa que el servidor está corriendo y muestra algunos endpoints útiles.
   */
  private onListening(): void {
    logger.info(`🚀 Servidor corriendo en http://localhost:${this.port}`);
    logger.info(`Endpoint de bucket: http://localhost:${this.port}/api/bucket/max-space`);
  }

  /**
   * Manejador de errores del servidor.
   * Trata errores comunes y detiene el proceso si es necesario.
   * @param error Error del sistema.
   */
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

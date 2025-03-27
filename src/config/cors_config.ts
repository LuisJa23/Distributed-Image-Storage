import cors, { CorsOptions } from 'cors';

export class CorsConfig {
  /**
   * Retorna el middleware de CORS configurado.
   * Permite solicitudes sin origin (por ejemplo, desde Postman) y
   * orígenes que empiecen con "http://localhost" (con o sin puerto).
   */
  public static getCorsMiddleware() {
    const options: CorsOptions = {
      origin: (origin, callback) => {
        // Permite solicitudes sin origin.
        if (!origin) return callback(null, true);
        // Permite orígenes que comiencen con "http://localhost" (opcionalmente con puerto).
        if (origin.match(/^http:\/\/localhost(:\d+)?/)) {
          return callback(null, true);
        }
        // Rechaza solicitudes de otros orígenes.
        return callback(new Error('No permitido por CORS'), false);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };

    return cors(options);
  }
}

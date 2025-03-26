// src/config/cors_config.ts
import cors, { CorsOptions } from 'cors';

export class CorsConfig {
  public static getCorsMiddleware() {
    const options: CorsOptions = {
      origin: (origin, callback) => {
        // Permite solicitudes sin origin (por ejemplo, Postman)
        if (!origin) return callback(null, true);
        // Permite cualquier origen que empiece con "http://localhost" y opcionalmente incluya un puerto
        if (origin.match(/^http:\/\/localhost(:\d+)?/)) {
          return callback(null, true);
        }
        return callback(new Error('No permitido por CORS'), false);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };

    return cors(options);
  }
}

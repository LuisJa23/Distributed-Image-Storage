import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface HttpError extends Error {
  status?: number;
}

/**
 * Middleware para el manejo centralizado de errores.
 * Registra el error y envía una respuesta JSON con el mensaje de error.
 */
export const errorHandler = (
  err: HttpError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Registra el error usando el logger, incluyendo detalles como el stack, método y ruta.
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    method: req.method,
    path: req.path
  });

  // Envía una respuesta con el código de estado del error (o 500 por defecto) y los detalles del error.
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      // En modo desarrollo se incluye el stack del error para facilitar la depuración.
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

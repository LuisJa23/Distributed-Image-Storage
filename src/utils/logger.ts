import winston from 'winston';
import path from 'path';

// Crea el directorio de logs si no existe.
const logDir = path.join(process.cwd(), 'logs');

export const logger = winston.createLogger({
  // Nivel de logging configurado desde la variable de entorno o 'info' por defecto.
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    // Agrega un timestamp a cada mensaje de log.
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    // Incluye el stack trace en caso de error.
    winston.format.errors({ stack: true }),
    // Permite el uso de variables en los mensajes.
    winston.format.splat(),
    // Formatea el log en formato JSON.
    winston.format.json()
  ),
  transports: [
    // Transport para mostrar logs en la consola.
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Transport para escribir logs de error en un archivo.
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // Transport para escribir logs combinados en un archivo.
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

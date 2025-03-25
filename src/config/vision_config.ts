import vision from '@google-cloud/vision';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Google Cloud Vision
export const visionConfig = {
  // Credenciales (se cargan automáticamente desde GOOGLE_APPLICATION_CREDENTIALS)
  client: new vision.ImageAnnotatorClient(),

  // Configuraciones de procesamiento
  minConfidence: parseFloat(process.env.MIN_CONFIDENCE || '0.7'), // 70% de confianza mínima
  maxResults: parseInt(process.env.MAX_RESULTS || '10'), // Máximo 10 resultados
  keepTempFiles: process.env.KEEP_TEMP_FILES === 'true', // Conservar archivos temporales para debug

  // Validar configuración
  validate: () => {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('⚠️ Advertencia: Variable GOOGLE_APPLICATION_CREDENTIALS no configurada');
      return false;
    }
    return true;
  }
};

// Validar al cargar el módulo
visionConfig.validate();
import vision from '@google-cloud/vision';
import dotenv from 'dotenv';

dotenv.config();

export const visionConfig = {
  // Instancia del cliente para el servicio de anotación de imágenes de Google Cloud Vision.
  client: new vision.ImageAnnotatorClient(),

  // Configuraciones para el procesamiento de imágenes:
  // - Se define un umbral mínimo de confianza para los resultados (70% por defecto).
  // - Se establece un límite en el número de resultados devueltos (10 por defecto).
  // - Se decide si se deben conservar archivos temporales, lo que puede ayudar en depuración.
  minConfidence: parseFloat(process.env.MIN_CONFIDENCE || '0.7'),
  maxResults: parseInt(process.env.MAX_RESULTS || '10'),
  keepTempFiles: process.env.KEEP_TEMP_FILES === 'true',

  // Función para validar la configuración esencial.
  // Comprueba si la variable de entorno para las credenciales de Google Cloud está definida.
  validate: () => {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('⚠️ Advertencia: Variable GOOGLE_APPLICATION_CREDENTIALS no configurada');
      return false;
    }
    return true;
  }
};

// Se ejecuta la validación de la configuración al cargar el módulo,
// asegurando que las credenciales estén disponibles para el funcionamiento correcto del cliente.
visionConfig.validate();

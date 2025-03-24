import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';

// Función para limpiar archivos después de procesarlos
const cleanupFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Archivo temporal eliminado: ${filePath}`);
    }
  } catch (error) {
    console.error('Error al eliminar archivo temporal:', error);
  }
};

// Configuración del cliente de Google Vision
// Usar las credenciales de la variable de entorno
const client = new vision.ImageAnnotatorClient();

// Verificar la configuración de credenciales
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn('⚠️ Advertencia: Variable GOOGLE_APPLICATION_CREDENTIALS no configurada');
}

// Detectar puntos de referencia (Landmarks)
export const detectLandmark = async (filePath: string): Promise<any> => {
  try {
    console.log(`Detectando landmarks en: ${filePath}`);
    const [result] = await client.landmarkDetection(filePath);
    
    // Procesar resultados
    const landmarks = result.landmarkAnnotations || [];
    const formattedResults = landmarks.map(landmark => ({
      name: landmark.description || 'Desconocido',
      confidence: landmark.score ? (landmark.score * 100).toFixed(2) + '%' : 'N/A',
      locations: landmark.locations?.map(loc => ({
        latitude: loc.latLng?.latitude || 0,
        longitude: loc.latLng?.longitude || 0
      })) || []
    }));
    
    // Limpiar archivo temporal después de procesarlo
    cleanupFile(filePath);
    
    if (formattedResults.length === 0) {
      return { message: 'No se encontraron puntos de referencia en la imagen', results: [] };
    }
    
    return { results: formattedResults };
  } catch (error) {
    // Asegurar limpieza incluso en caso de error
    cleanupFile(filePath);
    console.error('Error en la detección de puntos de referencia:', error);
    throw new Error('Error al analizar la imagen para detectar puntos de referencia.');
  }
};

// Detectar etiquetas en la imagen
export const detectLabels = async (filePath: string): Promise<any> => {
  try {
    console.log(`Detectando etiquetas en: ${filePath}`);
    console.log('Usando archivo de credenciales:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    const [result] = await client.labelDetection(filePath);
    
    // Procesar resultados
    const labels = result.labelAnnotations || [];
    const formattedResults = labels.map(label => ({
      name: label.description || 'Desconocido',
      confidence: label.score ? (label.score * 100).toFixed(2) + '%' : 'N/A'
    }));
    
    // Limpiar archivo temporal
    cleanupFile(filePath);
    
    if (formattedResults.length === 0) {
      return { message: 'No se detectaron etiquetas en la imagen', results: [] };
    }
    
    return { results: formattedResults };
  } catch (error) {
    // Asegurar limpieza incluso en caso de error
    cleanupFile(filePath);
    console.error('Error en la detección de etiquetas:', error);
    throw new Error('Error al analizar la imagen para detectar etiquetas.');
  }
};
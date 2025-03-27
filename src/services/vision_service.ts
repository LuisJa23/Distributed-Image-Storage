import fs from 'fs';
import { visionConfig } from '../config/vision_config';

export interface LabelResult {
  name: string;
  confidence: string;
  rawScore: number;
}

export class VisionService {
  /**
   * Limpia el archivo temporal.
   * Si no está en modo debug, elimina el archivo especificado.
   * @param filePath Ruta del archivo a limpiar.
   */
  private static cleanupFile(filePath: string) {
    if (visionConfig.keepTempFiles) {
      console.log(`Modo debug: Conservando archivo temporal ${filePath}`);
      return;
    }

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Archivo temporal eliminado: ${filePath}`);
      }
    } catch (error) {
      console.error('Error al eliminar archivo temporal:', error);
    }
  }

  /**
   * Detecta etiquetas en la imagen usando Google Cloud Vision.
   * Filtra las etiquetas según la confianza mínima configurada.
   * @param filePath Ruta de la imagen.
   * @returns Objeto con la lista de etiquetas detectadas.
   * @throws Error si falla el análisis de la imagen.
   */
  static async detectLabels(filePath: string): Promise<{ results: LabelResult[] }> {
    try {
      console.log(`Iniciando detección de etiquetas para: ${filePath}`);
      
      const [result] = await visionConfig.client.labelDetection(filePath);

      // Procesa los resultados y filtra las etiquetas con confianza suficiente.
      const labels = (result.labelAnnotations || [])
        .filter(label => label.score && label.score >= visionConfig.minConfidence)
        .map(label => ({
          name: label.description || 'Desconocido',
          confidence: label.score ? `${(label.score * 100).toFixed(2)}%` : 'N/A',
          rawScore: label.score || 0
        }));

      // Se retorna la lista de etiquetas; si no hay etiquetas válidas se retorna un mensaje predeterminado.
      return { 
        results: labels.length > 0 
          ? labels 
          : [{ 
              name: 'No se detectaron objetos con suficiente confianza', 
              confidence: 'N/A', 
              rawScore: 0 
            }]
      };

    } catch (error) {
      // En caso de error, se limpia el archivo temporal y se lanza un error.
      this.cleanupFile(filePath);
      console.error('Error en detectLabels:', error);
      throw new Error(`Error al analizar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

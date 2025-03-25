import fs from 'fs';
import { visionConfig } from '../config/vision_config';

export interface LabelResult {
  name: string;
  confidence: string;
  rawScore: number;
}

export class VisionService {
  // Función para limpiar archivos después de procesarlos
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

  // Método para detectar etiquetas en la imagen
  static async detectLabels(filePath: string): Promise<{ results: LabelResult[] }> {
    try {
      console.log(`Iniciando detección de etiquetas para: ${filePath}`);
      
      const [result] = await visionConfig.client.labelDetection(filePath);

      // Procesar y filtrar resultados
      const labels = (result.labelAnnotations || [])
        .filter(label => label.score && label.score >= visionConfig.minConfidence)
        .map(label => ({
          name: label.description || 'Desconocido',
          confidence: label.score ? `${(label.score * 100).toFixed(2)}%` : 'N/A',
          rawScore: label.score || 0
        }));

      // Limpiar archivo temporal
      this.cleanupFile(filePath);

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
      this.cleanupFile(filePath);
      console.error('Error en detectLabels:', error);
      throw new Error(`Error al analizar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}


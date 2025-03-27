import { Request, Response } from 'express';
import { ImageService } from '../services/image_service';
import { MulterRequest } from '../interfaces/multer_request';

export class VisionController {
  // Endpoint para detectar etiquetas en una imagen utilizando el servicio de ImageService.
  // Requiere que la imagen se haya subido previamente y esté disponible en req.file.
  static async detectLabels(req: MulterRequest, res: Response): Promise<void> {
    try {
      // Verifica si se ha recibido un archivo; en caso contrario, responde con error 400.
      if (!req.file) {
        res.status(400).json({ 
          success: false,
          error: 'Por favor, sube una imagen.' 
        });
        return;
      }

      // Llama al servicio para detectar etiquetas en la imagen ubicada en req.file.path.
      const result = await ImageService.detectLabels(req.file.path);
      
      // Devuelve la respuesta con las etiquetas detectadas.
      res.json({ 
        success: true,
        labels: result 
      });
    } catch (error) {
      // Manejo de errores: registra el error en consola y responde con error 500.
      console.error('Error en VisionController.detectLabels:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al detectar etiquetas',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

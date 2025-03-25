import { Request, Response } from 'express';
import { ImageService } from '../services/image_service';
import { MulterRequest } from '../interfaces/multer_request';

export class VisionController {
  

  /**
   * Detecta etiquetas en una imagen
   * @param req Request con el archivo de imagen
   * @param res Response de Express
   */
  static async detectLabels(req: MulterRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ 
          success: false,
          error: 'Por favor, sube una imagen.' 
        });
        return;
      }

      const result = await ImageService.detectLabels(req.file.path);
      res.json({ 
        success: true,
        labels: result 
      });
    } catch (error) {
      console.error('Error en VisionController.detectLabels:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al detectar etiquetas',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
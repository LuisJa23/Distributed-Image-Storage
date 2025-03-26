import { Request, Response } from 'express';
import { ImageService } from '../services/image_service';

export class ImageController {
  // Endpoint para procesar la imagen enviada en la petición
  static async processImage(req: Request, res: Response): Promise<void> {
    try {
      // Verificar que se haya subido un archivo
      if (!req.file) {
        res.status(400).json({ error: 'El archivo de imagen es obligatorio.' });
        return;
      }
      
      // Utilizar la ruta temporal que multer genera
      const filePath = req.file.path;
      
      // Procesar y guardar la imagen completa
      const result = await ImageService.processAndSaveImage(filePath);
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error en ImageController.processImage:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

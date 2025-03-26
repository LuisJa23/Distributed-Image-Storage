// src/controllers/image_controller.ts
import { Request, Response } from 'express';
import { ImageService } from '../services/image_service';

export class ImageController {
  // Endpoint para procesar y guardar la imagen enviada en la petición
  static async processImage(req: Request, res: Response): Promise<void> {
    try {
      // Verificar que se haya subido un archivo
      if (!req.file) {
        res.status(400).json({ error: 'El archivo de imagen es obligatorio.' });
        return;
      }
      
      // Utilizar la ruta temporal que genera multer
      const filePath = req.file.path;
      
      // Procesar y guardar la imagen completa (incluye detección de etiquetas, almacenamiento en GCS y actualización de la BD)
      const result = await ImageService.processAndSaveImage(filePath);
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error en ImageController.processImage:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Endpoint para listar imágenes con paginación (50 por página por defecto)
  static async listImages(req: Request, res: Response): Promise<void> {
    try {
      // Obtener la página y el límite desde query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const { images, total } = await ImageService.listImages(page, limit);

      res.status(200).json({
        success: true,
        data: {
          images,
          total,
          page,
          limit
        }
      });
    } catch (error) {
      console.error('Error en ImageController.listImages:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Endpoint para eliminar una imagen (se recibe el nombre del archivo por parámetros)
  static async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;
      if (!fileName) {
        res.status(400).json({ error: 'El nombre del archivo es obligatorio.' });
        return;
      }
      
      await ImageService.deleteImage(fileName);
      res.status(200).json({ success: true, message: 'Imagen eliminada correctamente.' });
    } catch (error) {
      console.error('Error en ImageController.deleteImage:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

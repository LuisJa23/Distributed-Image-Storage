// src/controllers/image_controller.ts
import { Request, Response } from 'express';
import { ImageService } from '../services/image_service';

export class ImageController {
  // Método para procesar y guardar la imagen
  static async processImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'El archivo de imagen es obligatorio.' });
        return;
      }
      const filePath = req.file.path;
      const result = await ImageService.processAndSaveImage(filePath);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error en ImageController.processImage:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Método para listar imágenes con paginación
  static async listImages(req: Request, res: Response): Promise<void> {
    try {
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

  static async deleteImageById(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      if (!imageId) {
        res.status(400).json({ error: 'El id de la imagen es obligatorio.' });
        return;
      }
      
      // Convertir el id a número y validarlo
      const id = parseInt(imageId, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'El id proporcionado no es válido.' });
        return;
      }

      await ImageService.deleteImageById(id);
      res.status(200).json({ success: true, message: 'Imagen eliminada correctamente y espacio liberado en el bucket.' });
    } catch (error) {
      console.error('Error en ImageController.deleteImageById:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

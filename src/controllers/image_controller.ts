import { Request, Response } from 'express';
import { ImageService } from '../services/image_service';

export class ImageController {
  // Procesa y guarda la imagen recibida en la solicitud.
  // Valida la presencia del archivo, llama al servicio de procesamiento
  // y retorna el resultado de la operación.
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

  // Lista imágenes con paginación.
  // Extrae los parámetros de página y límite de la solicitud, consulta el servicio
  // para obtener las imágenes y devuelve los resultados junto con información de paginación.
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

  // Elimina una imagen específica por su ID.
  // Valida la presencia y el formato correcto del ID, llama al servicio
  // para eliminar la imagen y devuelve un mensaje de éxito.
  static async deleteImageById(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      if (!imageId) {
        res.status(400).json({ error: 'El id de la imagen es obligatorio.' });
        return;
      }
      
      // Convierte el ID a número y verifica su validez.
      const id = parseInt(imageId, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'El id proporcionado no es válido.' });
        return;
      }

      await ImageService.deleteImageById(id);
      res.status(200).json({ 
        success: true, 
        message: 'Imagen eliminada correctamente y espacio liberado en el bucket.' 
      });
    } catch (error) {
      console.error('Error en ImageController.deleteImageById:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Filtra y retorna imágenes basadas en una etiqueta específica.
  // Valida la presencia de la etiqueta en la consulta, limpia la entrada y
  // consulta el servicio para obtener las imágenes que coinciden con la etiqueta.
  static async getImagesByLabel(req: Request, res: Response): Promise<void> {
    try {
      let tag = req.query.tag as string;
      if (!tag) {
        res.status(400).json({ error: 'Debe proporcionar una etiqueta para filtrar.' });
        return;
      }

      // Elimina espacios y saltos de línea al inicio y final de la etiqueta.
      tag = tag.trim();

      const images = await ImageService.findImagesByLabel(tag);
      res.status(200).json({
        success: true,
        data: images,
        total: images.length
      });
    } catch (error) {
      console.error('Error en ImageController.getImagesByLabel:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

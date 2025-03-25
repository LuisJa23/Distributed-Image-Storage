import { Request, Response } from 'express';
import { ImageService } from '../services/image_service';
import { MulterRequest } from '../interfaces/multer_request';

export class ImageController {
  /**
   * Sube una imagen a Google Cloud Storage
   * @param req Request de Express con el archivo de imagen
   * @param res Response de Express
   */
  static async uploadImage(req: MulterRequest, res: Response): Promise<void> {
    try {
      // Validar que se haya subido un archivo
      if (!req.file) {
        res.status(400).json({ 
          success: false,
          error: 'No se proporcionó ningún archivo de imagen' 
        });
        return;
      }

      // Validar el tipo de archivo
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, GIF o WEBP'
        });
        return;
      }

      // Subir la imagen al servicio de almacenamiento
      const uploadResult = await ImageService.uploadImage(req.file.path);
      
      res.status(201).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          fileName: uploadResult.name,
          publicUrl: uploadResult.publicUrl
        }
      });

    } catch (error) {
      console.error('Error en ImageController.uploadImage:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno al procesar la imagen',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina una imagen de Google Cloud Storage
   * @param req Request de Express con el nombre del archivo a eliminar
   * @param res Response de Express
   */
  static async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;

      // Validar que se proporcionó un nombre de archivo
      if (!fileName) {
        res.status(400).json({
          success: false,
          error: 'Nombre de archivo no proporcionado'
        });
        return;
      }

      // Validar formato del nombre de archivo
      if (!/^[\w\-\.]+$/.test(fileName)) {
        res.status(400).json({
          success: false,
          error: 'Nombre de archivo no válido'
        });
        return;
      }

      // Eliminar la imagen del servicio de almacenamiento
      await ImageService.deleteImage(fileName);

      res.status(200).json({
        success: true,
        message: 'Imagen eliminada correctamente',
        data: {
          fileName: fileName
        }
      });

    } catch (error) {
      console.error('Error en ImageController.deleteImage:', error);
      
      // Manejar específicamente el error de archivo no encontrado
      if (error instanceof Error && error.message.includes('No such object')) {
        res.status(404).json({
          success: false,
          error: 'La imagen solicitada no existe'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Error interno al eliminar la imagen',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
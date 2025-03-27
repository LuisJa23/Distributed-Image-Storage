import { Request, Response } from 'express';
import { ImageService } from '../services/image_service';
import { MulterRequest } from '../interfaces/multer_request';

export class StorageController {
  
  // Endpoint para subir una imagen al servicio de almacenamiento.
  static async uploadImage(req: MulterRequest, res: Response): Promise<void> {
    try {
      // Verifica que se haya enviado un archivo en la solicitud.
      if (!req.file) {
        res.status(400).json({ 
          success: false,
          error: 'No se proporcionó ningún archivo de imagen' 
        });
        return;
      }

      // Define los tipos MIME válidos para las imágenes.
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      // Valida que el tipo MIME del archivo subido sea uno de los permitidos.
      if (!validMimeTypes.includes(req.file.mimetype)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, GIF o WEBP'
        });
        return;
      }

      // Llama al servicio para subir la imagen, pasando la ruta del archivo temporal.
      const uploadResult = await ImageService.uploadImage(req.file.path);
      
      // Responde con un estado 201 y datos sobre el archivo subido.
      res.status(201).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          fileName: uploadResult.name,
          publicUrl: uploadResult.publicUrl
        }
      });

    } catch (error) {
      // Manejo de errores: registra el error y responde con detalles en caso de fallo.
      console.error('Error en ImageController.uploadImage:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno al procesar la imagen',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Endpoint para eliminar una imagen del servicio de almacenamiento.
  static async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;

      // Verifica que se haya proporcionado el nombre del archivo en los parámetros de la solicitud.
      if (!fileName) {
        res.status(400).json({
          success: false,
          error: 'Nombre de archivo no proporcionado'
        });
        return;
      }

      // Valida el formato del nombre del archivo para evitar inyecciones o nombres maliciosos.
      if (!/^[\w\-\.]+$/.test(fileName)) {
        res.status(400).json({
          success: false,
          error: 'Nombre de archivo no válido'
        });
        return;
      }

      // Llama al servicio para eliminar la imagen usando el nombre del archivo.
      await ImageService.deleteImage(fileName);

      // Responde con éxito si la imagen se elimina correctamente.
      res.status(200).json({
        success: true,
        message: 'Imagen eliminada correctamente',
        data: {
          fileName: fileName
        }
      });

    } catch (error) {
      // Registra el error y maneja específicamente el caso de imagen no encontrada.
      console.error('Error en ImageController.deleteImage:', error);
      
      if (error instanceof Error && error.message.includes('No such object')) {
        res.status(404).json({
          success: false,
          error: 'La imagen solicitada no existe'
        });
        return;
      }

      // Responde con un error 500 para otros casos no específicos.
      res.status(500).json({
        success: false,
        error: 'Error interno al eliminar la imagen',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

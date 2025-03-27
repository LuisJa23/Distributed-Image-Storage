import { Request, Response } from 'express';
import { BucketService } from '../services/bucket_service';

export class BucketController {
  // Endpoint para obtener el bucket con mayor espacio disponible.
  // Se utiliza el servicio para buscar el bucket y se responde según el resultado obtenido.
  static async getBucketWithMostSpace(req: Request, res: Response): Promise<void> {
    try {
      const bucketService = new BucketService();
      // Se consulta el bucket con más espacio disponible.
      const bucket = await bucketService.getBucketWithMostAvailableSpace();
      if (!bucket) {
        // Responde con 404 si no se encuentra ningún bucket disponible.
        res.status(404).json({
          success: false,
          message: 'No se encontró ningún bucket con espacio disponible.'
        });
        return;
      }
      // Responde con 200 y los datos del bucket encontrado.
      res.status(200).json({
        success: true,
        data: bucket
      });
    } catch (error) {
      // Manejo de errores: se registra el error y se responde con un mensaje genérico de error interno.
      console.error('Error al obtener el bucket con más espacio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Endpoint para crear un nuevo bucket en Google Cloud Storage y registrarlo en la base de datos.
  static async createBucket(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body; // Se espera que el nombre del bucket se encuentre en el cuerpo de la solicitud.
      if (!name) {
        // Responde con 400 si no se proporciona un nombre para el bucket.
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar un nombre para el bucket.'
        });
        return;
      }

      const bucketService = new BucketService();
      // Se crea un nuevo bucket utilizando el servicio.
      const newBucket = await bucketService.createNewBucket(name);

      // Responde con 201 indicando que el bucket fue creado exitosamente.
      res.status(201).json({
        success: true,
        message: 'Bucket creado correctamente.',
        data: newBucket
      });
    } catch (error) {
      // Manejo de errores: se registra el error y se responde con detalles adecuados.
      console.error('Error al crear el bucket:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

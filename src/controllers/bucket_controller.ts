// src/controllers/bucket_controller.ts
import { Request, Response } from 'express';
import { BucketService } from '../services/bucket_service';

export class BucketController {
  // Endpoint para obtener el bucket con más espacio disponible
  static async getBucketWithMostSpace(req: Request, res: Response): Promise<void> {
    try {
      const bucketService = new BucketService();
      const bucket = await bucketService.getBucketWithMostAvailableSpace();
      if (!bucket) {
        res.status(404).json({
          success: false,
          message: 'No se encontró ningún bucket con espacio disponible.'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: bucket
      });
    } catch (error) {
      console.error('Error al obtener el bucket con más espacio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Nuevo endpoint: crear un bucket en GCS y registrarlo en la BD
  static async createBucket(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body; // Supongamos que el nombre del bucket viene en req.body.name
      if (!name) {
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar un nombre para el bucket.'
        });
      }

      const bucketService = new BucketService();
      const newBucket = await bucketService.createNewBucket(name);

      res.status(201).json({
        success: true,
        message: 'Bucket creado correctamente.',
        data: newBucket
      });
    } catch (error) {
      console.error('Error al crear el bucket:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

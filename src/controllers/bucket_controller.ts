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
}

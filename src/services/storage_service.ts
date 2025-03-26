// src/services/storage_service.ts
import { storageClient } from '../config/storage_config';
import path from 'path';
import fs from 'fs';
import { BucketService } from './bucket_service';

export class StorageService {
  // Función para subir imagen
  static async uploadImage(filePath: string, destinationName?: string) {
    try {
      // Consultar el bucket con más espacio disponible
      const bucketService = new BucketService();
      const bucket = await bucketService.getBucketWithMostAvailableSpace();
      if (!bucket) {
        throw new Error('No se encontró un bucket disponible.');
      }
      const bucketName = bucket.name;
      const destName = destinationName || path.basename(filePath);
      
      const [file] = await storageClient.bucket(bucketName).upload(filePath, {
        destination: destName,
        metadata: {
          cacheControl: 'public, max-age=31536000'
        }
      });

      // Eliminar el archivo local después de subir
      fs.unlinkSync(filePath);

      return {
        name: file.name,
        publicUrl: `https://storage.googleapis.com/${bucketName}/${destName}`
      };
    } catch (error) {
      throw new Error(`Error al subir imagen: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Función para eliminar imagen
  static async deleteImage(fileName: string) {
    try {
      // Consultar el bucket con más espacio disponible
      const bucketService = new BucketService();
      const bucket = await bucketService.getBucketWithMostAvailableSpace();
      if (!bucket) {
        throw new Error('No se encontró un bucket disponible.');
      }
      const bucketName = bucket.name;
      await storageClient.bucket(bucketName).file(fileName).delete();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar imagen: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

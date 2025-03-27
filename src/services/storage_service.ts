import { Storage } from '@google-cloud/storage';
import { storageClient } from '../config/storage_config';
import path from 'path';
import fs from 'fs';
import { BucketService } from './bucket_service';

export class StorageService {
  
  /**
   * Sube una imagen a Cloud Storage.
   * 
   * - Obtiene el bucket con más espacio disponible.
   * - Sube el archivo a dicho bucket.
   * - Elimina el archivo local después de la carga.
   * 
   * @param filePath Ruta local del archivo.
   * @param destinationName (Opcional) Nombre de destino en el bucket.
   * @returns Objeto con el nombre del archivo y su URL pública.
   */
  static async uploadImage(filePath: string, destinationName?: string) {
    try {
      // Obtener el bucket con más espacio disponible.
      const bucketService = new BucketService();
      const bucket = await bucketService.getBucketWithMostAvailableSpace();
      if (!bucket) {
        throw new Error('No se encontró un bucket disponible.');
      }
      const bucketName = bucket.name;
      const destName = destinationName || path.basename(filePath);
      
      // Subir el archivo a Cloud Storage.
      const [file] = await storageClient.bucket(bucketName).upload(filePath, {
        destination: destName,
        metadata: {
          cacheControl: 'public, max-age=31536000'
        }
      });

      // Eliminar el archivo local tras la subida.
      fs.unlinkSync(filePath);

      return {
        name: file.name,
        publicUrl: `https://storage.googleapis.com/${bucketName}/${destName}`
      };
    } catch (error) {
      throw new Error(`Error al subir imagen: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Elimina una imagen de Cloud Storage.
   * 
   * - Utiliza el bucket con más espacio disponible para localizar el archivo.
   * 
   * @param fileName Nombre del archivo a eliminar.
   * @returns true si se eliminó correctamente.
   */
  static async deleteImage(fileName: string) {
    try {
      // Obtener el bucket con más espacio disponible.
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

  /**
   * Elimina una imagen de un bucket específico.
   * 
   * - Utiliza el nombre del bucket y el nombre del archivo para eliminar la imagen.
   * 
   * @param bucketName Nombre del bucket.
   * @param fileName Nombre del archivo a eliminar.
   * @returns true si la eliminación fue exitosa.
   */
  static async deleteImageFromBucket(bucketName: string, fileName: string) {
    try {
      await storageClient.bucket(bucketName).file(fileName).delete();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar imagen del bucket ${bucketName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

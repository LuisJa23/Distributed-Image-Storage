import { storageClient, bucketName } from '../config/storage_config';
import path from 'path';
import fs from 'fs';

export class StorageService {
  static async uploadImage(filePath: string, destinationName?: string) {
    try {
      const destName = destinationName || path.basename(filePath);
      
      const [file] = await storageClient.bucket(bucketName).upload(filePath, {
        destination: destName,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
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

  static async deleteImage(fileName: string) {
    try {
      await storageClient.bucket(bucketName).file(fileName).delete();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar imagen: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
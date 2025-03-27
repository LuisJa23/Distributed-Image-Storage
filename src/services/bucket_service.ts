// src/services/bucket_service.ts
import { DatabaseConnection } from '../config/database_config';
import { Bucket } from '../entities/bucket';
import { storageClient } from '../config/storage_config';

export class BucketService {
  private bucketRepository = DatabaseConnection.getInstance().getRepository(Bucket);

  // Método existente (devuelve el bucket con más espacio disponible)
  async getBucketWithMostAvailableSpace(): Promise<Bucket | null> {
    return await this.bucketRepository
      .createQueryBuilder('bucket')
      .orderBy('bucket.storage', 'DESC')
      .getOne();
  }

  // Nuevo método: crear un bucket en GCS y registrarlo en la BD
  async createNewBucket(bucketName: string): Promise<Bucket> {
    try {
      // 1. Crear el bucket en Google Cloud Storage
      // Puedes ajustar la ubicación y la clase de almacenamiento según tu preferencia
      await storageClient.createBucket(bucketName, {
        location: 'US',
        storageClass: 'STANDARD'
      });
      console.log(`Bucket [${bucketName}] creado correctamente en GCS.`);

      // 2. Crear el registro en la BD con un tamaño predeterminado de 100
      const newBucket = this.bucketRepository.create({
        name: bucketName,
        storage: 100 // Espacio disponible en MB (por ejemplo)
      });

      // 3. Guardar en la base de datos
      await this.bucketRepository.save(newBucket);

      return newBucket;
    } catch (error) {
      console.error('Error al crear bucket en GCS:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al crear bucket'
      );
    }
  }
}

import { DatabaseConnection } from '../config/database_config';
import { Bucket } from '../entities/bucket';
import { storageClient } from '../config/storage_config';

export class BucketService {
  // Repositorio para interactuar con la entidad Bucket en la base de datos.
  private bucketRepository = DatabaseConnection.getInstance().getRepository(Bucket);

  /**
   * Retorna el bucket con mayor espacio disponible.
   * Ordena los buckets por el campo "storage" de forma descendente.
   * @returns El bucket con más espacio o null si no existe ninguno.
   */
  async getBucketWithMostAvailableSpace(): Promise<Bucket | null> {
    return await this.bucketRepository
      .createQueryBuilder('bucket')
      .orderBy('bucket.storage', 'DESC')
      .getOne();
  }

  /**
   * Crea un nuevo bucket en Google Cloud Storage y lo registra en la base de datos.
   * 
   * Pasos:
   * 1. Crea el bucket en GCS con configuración predeterminada (ubicación y clase de almacenamiento).
   * 2. Registra el bucket en la base de datos con un tamaño predeterminado (por ejemplo, 100 MB).
   * 
   * @param bucketName Nombre del bucket a crear.
   * @returns El bucket recién creado.
   * @throws Error en caso de fallo en la creación del bucket.
   */
  async createNewBucket(bucketName: string): Promise<Bucket> {
    try {
      // 1. Crear el bucket en Google Cloud Storage con configuración predeterminada.
      await storageClient.createBucket(bucketName, {
        location: 'US',
        storageClass: 'STANDARD'
      });
      console.log(`Bucket [${bucketName}] creado correctamente en GCS.`);

      // 2. Crear el registro en la base de datos con un tamaño predeterminado (por ejemplo, 100 MB).
      const newBucket = this.bucketRepository.create({
        name: bucketName,
        storage: 100
      });

      // 3. Guardar el nuevo bucket en la base de datos.
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

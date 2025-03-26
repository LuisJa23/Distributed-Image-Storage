import { DatabaseConnection } from '../config/database_config';
import { Bucket } from '../entities/bucket';

export class BucketService {
  // Obtiene el repositorio de Bucket desde la conexión
  private bucketRepository = DatabaseConnection.getInstance().getRepository(Bucket);

  // Método que devuelve el bucket con más espacio disponible (orden descendente)
  async getBucketWithMostAvailableSpace(): Promise<Bucket | null> {
    return await this.bucketRepository
      .createQueryBuilder('bucket')
      .orderBy('bucket.storage', 'DESC')
      .getOne();
  }
}

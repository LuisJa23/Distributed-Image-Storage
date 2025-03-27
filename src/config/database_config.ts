import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';
import { Image } from '../entities/image';
import { Label } from '../entities/label';
import { Bucket } from '../entities/bucket';

/**
 * Clase DatabaseConnection: configura y gestiona la conexión a la base de datos.
 */
export class DatabaseConnection {
  // Instancia singleton de DataSource para evitar múltiples conexiones.
  private static instance: DataSource;

  // Constructor privado para forzar el uso del método getInstance().
  private constructor() {}

  /**
   * Retorna la instancia de DataSource.
   * Si no existe, la crea usando la configuración del entorno.
   * @returns Instancia de DataSource.
   */
  public static getInstance(): DataSource {
    if (!this.instance) {
      this.instance = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '1123',
        database: 'image_storage',
        entities: [Image, Label, Bucket],
        synchronize: true, // Activado solo en desarrollo para sincronizar el esquema
        logging: true
      });
    }
    return this.instance;
  }

  /**
   * Inicializa la conexión a la base de datos.
   * Imprime en consola las entidades configuradas y mapeadas.
   * @throws Error si falla la conexión.
   */
  public static async initialize(): Promise<void> {
    try {
      const dataSource = this.getInstance();
      console.log('Entidades configuradas:', dataSource.options.entities);
      await dataSource.initialize();
      const entities = dataSource.entityMetadatas;
      console.log(
        'Entidades mapeadas:',
        entities.map(e => ({
          name: e.name,
          tableName: e.tableName,
          columns: e.columns.map(c => c.propertyName)
        }))
      );
      logger.info('Conexión a la base de datos establecida correctamente');
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      logger.error('Error al inicializar la conexión con la base de datos', error);
      throw error;
    }
  }
}

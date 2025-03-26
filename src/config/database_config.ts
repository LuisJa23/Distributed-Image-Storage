import "reflect-metadata";
import { DataSource } from "typeorm";
import { logger } from "../utils/logger";
import { Image } from "../entities/image";
import { Label } from "../entities/label";
import { Bucket } from "../entities/bucket";

export class DatabaseConnection {
  private static instance: DataSource;

  private constructor() {}

  public static getInstance(): DataSource {
    if (!this.instance) {
      this.instance = new DataSource({
        type: "mysql",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306"),
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "1123",
        database: "image_storage",
        entities: [Image, Label, Bucket],
        // Importante: esto creará las tablas automáticamente
        synchronize: true, // Solo en desarrollo
        logging: true // Para ver qué está pasando
      });
    }
    return this.instance;
  }

  public static async initialize(): Promise<void> {
    try {
      const dataSource = this.getInstance();
      
      // Debugging de entidades
      console.log('Rutas de entidades:', dataSource.options.entities);
      console.log('Entidad Image:', Image);

      await dataSource.initialize();
      
      // Verificar metadatos de entidades
      const entities = dataSource.entityMetadatas;
      console.log('Entidades mapeadas:', entities.map(e => ({
        name: e.name,
        tableName: e.tableName,
        columns: e.columns.map(c => c.propertyName)
      })));

      logger.info("Database connection established successfully");
    } catch (error) {
      console.error('Detalles completos del error:', error);
      logger.error("Error initializing database connection", error);
      throw error;
    }
  }
}
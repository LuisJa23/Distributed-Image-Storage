// src/services/image_service.ts
import fs from 'fs';
import path from 'path';
import { StorageService } from './storage_service';
import { VisionService } from './vision_service';
import { BucketService } from './bucket_service';
import { DatabaseConnection } from '../config/database_config';
import { Image } from '../entities/image';
import { Label } from '../entities/label';

export class ImageService {
  // Endpoint simple: Sube la imagen a Cloud Storage y retorna su info.
  static async uploadImage(filePath: string) {
    return await StorageService.uploadImage(filePath);
  }

  // Endpoint simple: Elimina la imagen en Cloud Storage.
  static async deleteImage(fileName: string) {
    return await StorageService.deleteImage(fileName);
  }

  // Endpoint simple: Detecta etiquetas en la imagen.
  static async detectLabels(filePath: string) {
    return await VisionService.detectLabels(filePath);
  }

  // Funcionalidad completa para procesar y guardar la imagen
  static async processAndSaveImage(filePath: string): Promise<any> {
    // 1. Obtener el bucket con más espacio disponible
    const bucketService = new BucketService();
    const bucket = await bucketService.getBucketWithMostAvailableSpace();
    if (!bucket) {
      throw new Error('No se encontró ningún bucket disponible.');
    }

    // 2. Determinar el tamaño de la imagen en bytes y convertir a MB
    const stats = fs.statSync(filePath);
    const fileSizeBytes = stats.size;
    const fileSizeMB = fileSizeBytes / (1024 * 1024);

    // Verificar que el bucket tenga suficiente espacio (se asume bucket.storage en MB)
    if (bucket.storage < fileSizeMB) {
      throw new Error(
        `El bucket no tiene espacio suficiente para esta imagen. La imagen requiere ${fileSizeMB.toFixed(
          2
        )} MB, pero solo hay ${bucket.storage.toFixed(2)} MB disponibles.`
      );
    }

    // Restar el tamaño de la imagen (en MB) al espacio disponible del bucket
    bucket.storage -= fileSizeMB;

    // 3. Crear la entidad Image asociada al bucket (la URL se actualizará luego)
    const dataSource = DatabaseConnection.getInstance();
    const imageRepository = dataSource.getRepository(Image);
    const imageEntity = imageRepository.create({
      file_name: path.basename(filePath),
      size: fileSizeBytes, // Guardamos el tamaño en bytes
      url: '', // Se actualizará después de subir la imagen
      bucket: bucket
    });
    await imageRepository.save(imageEntity);

    // 4. Llamar a Google Vision para obtener etiquetas (usa el filePath local)
    const labelsResult = await VisionService.detectLabels(filePath);

    // Crear cada etiqueta asociada a la imagen
    const labelRepository = dataSource.getRepository(Label);
    for (const labelData of labelsResult.results) {
      const labelEntity = labelRepository.create({
        name: labelData.name,
        confidence: labelData.rawScore,
        image: imageEntity
      });
      await labelRepository.save(labelEntity);
    }

    // 5. Subir la imagen a Google Cloud Storage
    // Antes de subir, se verifica que el archivo exista
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe en la ruta especificada: ${filePath}`);
    }
    const storageResult = await StorageService.uploadImage(filePath);

    // Actualizar la entidad Image con la URL pública obtenida
    imageEntity.url = storageResult.publicUrl;
    await imageRepository.save(imageEntity);

    // 6. Actualizar el bucket en la base de datos con el espacio restante
    const bucketRepository = dataSource.getRepository(bucket.constructor);
    await bucketRepository.save(bucket);

    return {
      image: imageEntity,
      labels: labelsResult.results,
      storageInfo: storageResult
    };
  }

  // Nuevo método para listar imágenes con paginación
  static async listImages(page: number = 1, limit: number = 50): Promise<{ images: Image[]; total: number }> {
    const dataSource = DatabaseConnection.getInstance();
    const imageRepository = dataSource.getRepository(Image);

    // Calcular el offset en función de la página solicitada
    const skip = (page - 1) * limit;

    // Obtener la lista de imágenes y el total de registros
    const [images, total] = await imageRepository.findAndCount({
      skip,
      take: limit,
      order: { id: 'DESC' } // Ordena según tus necesidades (puede ser 'createdAt' si existe)
    });

    return { images, total };
  }
}

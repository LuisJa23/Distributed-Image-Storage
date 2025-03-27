import fs from 'fs';
import path from 'path';
import { StorageService } from './storage_service';
import { VisionService } from './vision_service';
import { BucketService } from './bucket_service';
import { DatabaseConnection } from '../config/database_config';
import { Image } from '../entities/image';
import { Label } from '../entities/label';

export class ImageService {
  // Sube la imagen a Cloud Storage y retorna su información.
  static async uploadImage(filePath: string) {
    return await StorageService.uploadImage(filePath);
  }

  // Elimina la imagen de Cloud Storage.
  static async deleteImage(fileName: string) {
    return await StorageService.deleteImage(fileName);
  }

  // Detecta etiquetas en la imagen usando el servicio de Vision.
  static async detectLabels(filePath: string) {
    return await VisionService.detectLabels(filePath);
  }

  // Procesa y guarda la imagen:
  // 1. Obtiene el bucket con más espacio disponible.
  // 2. Verifica el tamaño de la imagen y actualiza el espacio del bucket.
  // 3. Crea y guarda la entidad Image en la base de datos.
  // 4. Detecta etiquetas con Google Vision y guarda cada etiqueta.
  // 5. Sube la imagen a Cloud Storage y actualiza la URL en la entidad.
  // 6. Actualiza el bucket con el espacio restante.
  static async processAndSaveImage(filePath: string): Promise<any> {
    // 1. Obtener el bucket con más espacio disponible.
    const bucketService = new BucketService();
    const bucket = await bucketService.getBucketWithMostAvailableSpace();
    if (!bucket) {
      throw new Error('No se encontró ningún bucket disponible.');
    }

    // 2. Determinar el tamaño del archivo en bytes y convertirlo a MB.
    const stats = fs.statSync(filePath);
    const fileSizeBytes = stats.size;
    const fileSizeMB = fileSizeBytes / (1024 * 1024);

    // Verificar si el bucket tiene suficiente espacio.
    if (bucket.storage < fileSizeMB) {
      throw new Error(
        `El bucket no tiene espacio suficiente para esta imagen. La imagen requiere ${fileSizeMB.toFixed(
          2
        )} MB, pero solo hay ${bucket.storage.toFixed(2)} MB disponibles.`
      );
    }

    // Restar el tamaño de la imagen al espacio disponible del bucket.
    bucket.storage -= fileSizeMB;

    // 3. Crear la entidad Image y guardarla en la base de datos.
    const dataSource = DatabaseConnection.getInstance();
    const imageRepository = dataSource.getRepository(Image);
    const imageEntity = imageRepository.create({
      file_name: path.basename(filePath),
      size: fileSizeBytes, // Tamaño en bytes.
      url: '', // Se actualizará después de subir la imagen.
      bucket: bucket
    });
    await imageRepository.save(imageEntity);

    // 4. Usar Google Vision para detectar etiquetas en la imagen.
    const labelsResult = await VisionService.detectLabels(filePath);

    // Guardar cada etiqueta asociada a la imagen.
    const labelRepository = dataSource.getRepository(Label);
    for (const labelData of labelsResult.results) {
      const labelEntity = labelRepository.create({
        name: labelData.name,
        confidence: labelData.rawScore,
        image: imageEntity
      });
      await labelRepository.save(labelEntity);
    }

    // 5. Verificar que el archivo exista y subir la imagen a Cloud Storage.
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe en la ruta especificada: ${filePath}`);
    }
    const storageResult = await StorageService.uploadImage(filePath);

    // Actualizar la entidad Image con la URL pública.
    imageEntity.url = storageResult.publicUrl;
    await imageRepository.save(imageEntity);

    // 6. Actualizar el bucket en la base de datos con el espacio restante.
    const bucketRepository = dataSource.getRepository(bucket.constructor);
    await bucketRepository.save(bucket);

    return {
      image: imageEntity,
      labels: labelsResult.results,
      storageInfo: storageResult
    };
  }

  // Lista imágenes con paginación.
  // Parámetros: página actual y cantidad de registros por página.
  static async listImages(page: number = 1, limit: number = 50): Promise<{ images: Image[]; total: number }> {
    const dataSource = DatabaseConnection.getInstance();
    const imageRepository = dataSource.getRepository(Image);
    const skip = (page - 1) * limit;

    const [images, total] = await imageRepository.findAndCount({
      skip,
      take: limit,
      order: { id: 'DESC' }
    });

    return { images, total };
  }
  
  // Elimina una imagen por su ID.
  // Actualiza el espacio del bucket liberando el espacio ocupado por la imagen.
  static async deleteImageById(imageId: number): Promise<any> {
    const dataSource = DatabaseConnection.getInstance();
    const imageRepository = dataSource.getRepository(Image);
    
    // Buscar la imagen por ID y cargar la relación con el bucket.
    const imageEntity = await imageRepository.findOne({
      where: { id: imageId },
      relations: ['bucket']
    });
    
    if (!imageEntity) {
      throw new Error('Imagen no encontrada.');
    }
    
    // Eliminar la imagen de Cloud Storage usando el nombre del bucket y el nombre del archivo.
    await StorageService.deleteImageFromBucket(imageEntity.bucket.name, imageEntity.file_name);

    // Liberar el espacio en el bucket (convertido a MB).
    const fileSizeMB = imageEntity.size / (1024 * 1024);
    imageEntity.bucket.storage += fileSizeMB;

    // Actualizar el bucket en la base de datos.
    const bucketRepository = dataSource.getRepository(imageEntity.bucket.constructor);
    await bucketRepository.save(imageEntity.bucket);

    // Eliminar la entidad de imagen en la base de datos.
    await imageRepository.remove(imageEntity);

    return true;
  }

  // Busca imágenes que tengan una etiqueta específica.
  static async findImagesByLabel(labelName: string): Promise<Image[]> {
    const dataSource = DatabaseConnection.getInstance();
    const imageRepository = dataSource.getRepository(Image);

    const images = await imageRepository
      .createQueryBuilder('image')
      .innerJoinAndSelect('image.labels', 'label')
      .innerJoinAndSelect('image.bucket', 'bucket')
      .where('LOWER(label.name) = LOWER(:labelName)', { labelName })
      .getMany();

    return images;
  }
}

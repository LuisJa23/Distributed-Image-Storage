// src/routes/index.ts
import { Router } from 'express';
import { uploadMiddleware } from '../config/multer_config';
import { VisionController } from '../controllers/vision_controller';
import { BucketController } from '../controllers/bucket_controller';
import { ImageController } from '../controllers/image_controller';

const router = Router();

// Procesa la imagen: valida, procesa, guarda, sube a GCS y actualiza la BD
router.post('/process-image', uploadMiddleware, ImageController.processImage);

// Lista todas las imágenes con paginación (50 por página por defecto)
// Ejemplo: GET /images?page=1&limit=50
router.get('/images', ImageController.listImages);

// Elimina una imagen, se recibe el nombre del archivo por parámetro en la URL
router.delete('/images/:fileName', ImageController.deleteImage);

// Endpoint para detectar etiquetas en la imagen
router.post('/labels', uploadMiddleware, VisionController.detectLabels);

// Endpoint para obtener el bucket con más espacio disponible
router.get('/bucket/max-space', BucketController.getBucketWithMostSpace);

export default router;

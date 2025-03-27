// src/routes/routes.ts
import { Router } from 'express';
import { ImageController } from '../controllers/image_controller';
import { StorageController } from '../controllers/storage_controller';
import { BucketController } from '../controllers/bucket_controller';

const router = Router();

// Rutas para storage
router.post('/storage/upload', StorageController.uploadImage);
router.delete('/storage/:fileName', StorageController.deleteImage);

// Rutas para imágenes
router.delete('/images/id/:imageId', ImageController.deleteImageById);
router.get('/images', ImageController.listImages);
router.post('/images/process', ImageController.processImage);

// Ruta para bucket
router.get('/bucket/max-space', BucketController.getBucketWithMostSpace);

export default router;

// src/routes/routes.ts
import { Router } from 'express';
import { ImageController } from '../controllers/image_controller';
import { StorageController } from '../controllers/storage_controller';
import { BucketController } from '../controllers/bucket_controller';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Rutas para storage
router.post('/storage/upload', upload.single('image'), StorageController.uploadImage);
router.delete('/storage/:fileName', StorageController.deleteImage);

// Rutas para imágenes
router.delete('/images/id/:imageId', ImageController.deleteImageById);
router.get('/images', ImageController.listImages);
router.post('/images/process', upload.single('image'), ImageController.processImage);

// Ruta para obtener el bucket con más espacio
router.get('/bucket/max-space', BucketController.getBucketWithMostSpace);

// Nuevo endpoint para crear un bucket
router.post('/bucket/create', BucketController.createBucket);

export default router;

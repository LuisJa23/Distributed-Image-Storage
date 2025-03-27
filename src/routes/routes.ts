import { Router } from 'express';
import { ImageController } from '../controllers/image_controller';
import { StorageController } from '../controllers/storage_controller';
import { BucketController } from '../controllers/bucket_controller';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Configuración básica para manejo de archivos

// Rutas para operaciones de almacenamiento de imágenes
router.post('/storage/upload', upload.single('image'), StorageController.uploadImage); // Sube una imagen
router.delete('/storage/:fileName', StorageController.deleteImage); // Elimina una imagen por su nombre

// Rutas para operaciones con imágenes
router.delete('/images/id/:imageId', ImageController.deleteImageById); // Elimina una imagen por ID
router.get('/images', ImageController.listImages); // Lista imágenes con paginación
router.post('/images/process', upload.single('image'), ImageController.processImage); // Procesa y guarda una imagen

// Rutas para operaciones con buckets
router.get('/bucket/max-space', BucketController.getBucketWithMostSpace); // Obtiene el bucket con mayor espacio disponible
router.post('/bucket/create', BucketController.createBucket); // Crea un nuevo bucket

// Ruta para obtener imágenes filtradas por etiqueta
router.get('/images/by-label', ImageController.getImagesByLabel); // Filtra imágenes por etiqueta

export default router;

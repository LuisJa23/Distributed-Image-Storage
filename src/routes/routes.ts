import { Router } from 'express';
import { StorageController } from '../controllers/storage_controller';
import { uploadMiddleware } from '../config/multer_config';
import { VisionController } from '../controllers/vision_controller';
import { BucketController } from '../controllers/bucket_controller';
import { ImageController } from '../controllers/image_controller';

const router = Router();

router.post('/upload', uploadMiddleware, StorageController.uploadImage);
router.delete('/:fileName', StorageController.deleteImage);
router.post('/labels', uploadMiddleware, VisionController.detectLabels);
router.get('/bucket/max-space', BucketController.getBucketWithMostSpace);

router.post('/process-image', uploadMiddleware, ImageController.processImage);

export default router;

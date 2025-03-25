import { Router } from 'express';
import { StorageController } from '../controllers/storage_controller';
import { uploadMiddleware } from '../config/multer_config';
import { VisionController } from '../controllers/vision_controller';

const router = Router();

router.post('/upload', uploadMiddleware, StorageController.uploadImage);
router.delete('/:fileName', StorageController.deleteImage);
router.post('/labels', uploadMiddleware, VisionController.detectLabels);

export default router;
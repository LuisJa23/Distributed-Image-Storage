import { Router } from 'express';
import { ImageController } from '../controllers/image_controller';
import { imageUpload } from '../config/multer_config';

const router = Router();

router.post('/upload', imageUpload, ImageController.uploadImage);
router.delete('/:fileName', ImageController.deleteImage);

export default router;
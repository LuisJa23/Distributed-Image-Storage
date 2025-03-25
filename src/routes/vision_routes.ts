import { Router } from 'express';
import { VisionController } from '../controllers/vision_controller';
import { imageUpload } from '../config/multer_config';

const router = Router();

router.post('/landmark', imageUpload, VisionController.detectLandmark);
router.post('/labels', imageUpload, VisionController.detectLabels);

export default router;
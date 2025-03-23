import { Router, Request, Response } from 'express';
import { detectLandmark, detectLabels } from '../services/vision_service';
import upload from '../config/multer_config.js';


const router = Router();

router.post('/landmark', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Por favor, sube una imagen.' });
            return;
        }

        const result = await detectLandmark(req.file.path);
        res.json({ landmark: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});
router.post('/labels', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Por favor, sube una imagen.' });
            return;
        }

        const result = await detectLabels(req.file.path);
        res.json({ labels: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});


export default router;

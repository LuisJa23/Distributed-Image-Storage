import { Router, Request, Response } from 'express';
import { detectLandmark, detectLabels } from '../services/vision_service';
import upload from '../config/multer_config';


// Extendemos la interfaz Request para incluir el tipado correcto de `file`
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const router = Router();

// Endpoint para detección de puntos de referencia (landmarks)
router.post('/landmark', upload.single('image'), async (req: MulterRequest, res: Response): Promise<void> => {
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

router.post('/labels', upload.single('image'), async (req: MulterRequest, res: Response): Promise<void> => {
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

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const uploadDir = path.join(process.cwd(), 'temp_uploads');

// Crear directorio temporal si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración segura de almacenamiento
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

// Validación estricta de tipos MIME
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const validMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/jpg'
  ];

  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WEBP)'));
  }
};

// Configuración optimizada de Multer
const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
    parts: 2,
    headerPairs: 20 // Límite de headers
  }
});

// Middleware seguro para manejo de uploads
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const upload = multerUpload.single('image');

  upload(req, res, (err: any) => {
    if (err) {
      // Limpieza de archivos temporales en caso de error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      let errorMessage = 'Error al procesar el archivo';
      let statusCode = 400;

      if (err.code === 'LIMIT_FILE_SIZE') {
        errorMessage = 'El archivo excede el tamaño máximo de 10MB';
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        errorMessage = 'Se recibieron más archivos de los esperados';
      } else if (err.message.includes('Malformed part header')) {
        errorMessage = 'Formato de solicitud incorrecto';
      }

      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    next();
  });
};
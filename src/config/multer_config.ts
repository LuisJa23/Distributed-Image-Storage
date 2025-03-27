import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Ruta del directorio temporal donde se almacenarán los archivos subidos
const uploadDir = path.join(process.cwd(), 'temp_uploads');

// Verifica si el directorio temporal existe; si no, lo crea
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración del almacenamiento en disco para Multer
const storage = multer.diskStorage({
  // Especifica el directorio de destino para los archivos subidos
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir); // Guarda los archivos en el directorio temporal
  },
  // Asigna un nombre seguro al archivo para evitar conflictos o vulnerabilidades
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`); // Agrega una marca de tiempo para garantizar unicidad
  }
});

// Validación de tipos de archivos permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const validMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/jpg' // Alternativa para algunos navegadores
  ];

  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Acepta el archivo si el tipo MIME es válido
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WEBP)')); // Rechaza el archivo si el tipo no es válido
  }
};

// Configuración general de Multer con límites para mejorar la seguridad
const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Tamaño máximo de archivo: 10MB
    files: 1,                  // Solo se permite un archivo por solicitud
    parts: 2,                  // Número máximo de partes en la solicitud
    headerPairs: 20            // Máximo número de cabeceras en la solicitud
  }
});

// Middleware que maneja el proceso de carga de archivos
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const upload = multerUpload.single('image'); // Solo se espera un archivo bajo el campo 'image'

  upload(req, res, (err: any) => {
    if (err) {
      // Si hay un error y se subió un archivo temporal, se elimina
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      // Mensaje de error personalizado según el tipo de error detectado
      let errorMessage = 'Error al procesar el archivo';
      let statusCode = 400;

      if (err.code === 'LIMIT_FILE_SIZE') {
        errorMessage = 'El archivo excede el tamaño máximo de 10MB';
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        errorMessage = 'Se recibieron más archivos de los esperados';
      } else if (err.message.includes('Malformed part header')) {
        errorMessage = 'Formato de solicitud incorrecto';
      }

      // Envía la respuesta con el error correspondiente
      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined // Muestra más detalles solo en modo desarrollo
      });
    }
    next(); // Continúa con la siguiente función en la cadena de middleware si no hay errores
  });
};

import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

// 1. Configuración (ajusta estas rutas según tu proyecto)
const CONFIG = {
  CREDENTIALS_PATH: path.resolve(__dirname, '../config/tokyo-house-454522-g7-8ac87bf0be98.json'),
  BUCKET_NAME: 'laboratorio_2',
  IMAGE_PATH: path.resolve(__dirname, 'controllers/Tigre.jpg') // Ruta a tu imagen
};

// 2. Verifica que el archivo de imagen existe
if (!fs.existsSync(CONFIG.IMAGE_PATH)) {
  throw new Error(`❌ No se encontró la imagen en: ${CONFIG.IMAGE_PATH}`);
}

// 3. Inicializa el cliente de Google Cloud Storage
const storage = new Storage({
  keyFilename: CONFIG.CREDENTIALS_PATH,
  projectId: 'tokyo-house-454522-g7'
});

// 4. Función para subir la imagen
async function uploadImage() {
  try {
    console.log('📤 Iniciando subida de imagen...');

    const bucket = storage.bucket(CONFIG.BUCKET_NAME);
    const fileName = `Tigre-${Date.now()}.jpg`; // Nombre único en GCS
    const file = bucket.file(fileName);

    // Opciones de subida
    const options = {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          originalName: 'Tigre.jpg',
          uploadedAt: new Date().toISOString()
        }
      },
      public: true
    };

    // Sube el archivo
    await file.save(fs.readFileSync(CONFIG.IMAGE_PATH), options);
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${CONFIG.BUCKET_NAME}/${fileName}`;
    
    console.log('✅ ¡Imagen subida exitosamente!');
    console.log('🔗 URL pública:', publicUrl);

    return publicUrl;

  } catch (error) {
    console.error('❌ Error al subir la imagen:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// 5. Ejecuta la subida
uploadImage();
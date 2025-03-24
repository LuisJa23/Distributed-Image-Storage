import { Storage } from '@google-cloud/storage';
import path from 'path';
import dotenv from 'dotenv';

// Configura dotenv
dotenv.config();

// Configuración
const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.KEYFILENAME
});

async function uploadFile(bucketName: string, filePath: string, destinationName?: string) {
  try {
    if (!bucketName || !filePath) {
      throw new Error('Bucket name y file path son requeridos');
    }

    // Usa el nombre del archivo original si no se especifica uno
    const destName = destinationName || path.basename(filePath);
    
    console.log(`Subiendo ${filePath} a gs://${bucketName}/${destName}`);

    // Sube el archivo
    const [file] = await storage.bucket(bucketName).upload(filePath, {
      destination: destName,
      metadata: {
        // Opcional: configura metadatos adicionales
        cacheControl: 'public, max-age=31536000',
      },
    });

    console.log('✅ Archivo subido exitosamente');
    console.log(`🔗 URL: https://storage.googleapis.com/${bucketName}/${destName}`);

    return file;
  } catch (error) {
    console.error('❌ Error al subir archivo:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Uso
(async () => {
  try {
    const bucketName = process.env.BUCKET_NAME || 'laboratorio_2';
    const filePath = path.resolve(__dirname, 'controllers/Tigre.jpg');
    
    await uploadFile(bucketName, filePath, 'Tigre.jpg');
  } catch (error) {
    process.exit(1);
  }
})();
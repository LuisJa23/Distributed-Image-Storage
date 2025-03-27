import { Storage } from '@google-cloud/storage';

import dotenv from 'dotenv';

// Carga las variables de entorno definidas en el archivo .env
dotenv.config();

// Crea una instancia del cliente de Google Cloud Storage
// Se utilizan las variables de entorno para configurar el proyecto y las credenciales
export const storageClient = new Storage({
  projectId: process.env.PROJECT_ID,      // ID del proyecto en Google Cloud
  keyFilename: process.env.KEYFILENAME    // Ruta al archivo JSON con las credenciales de acceso
});

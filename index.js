require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const { Storage } = require('@google-cloud/storage');

// Configuración de Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplaza los saltos de línea
  },
});

// ...existing code...
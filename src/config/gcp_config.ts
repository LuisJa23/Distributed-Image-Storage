import Vision from '@google-cloud/vision';
import { Storage } from '@google-cloud/storage';

interface GCPConfig {
  credentials: string;
  projectId: string;
  bucketName: string;
}

const config: GCPConfig = {
  credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/credentials.json',
  projectId: process.env.GCP_PROJECT_ID || 'your-project-id',
  bucketName: process.env.GCS_BUCKET || 'your-bucket-name'
};

export const storage = new Storage({
  keyFilename: config.credentials,
  projectId: config.projectId
});

export const vision = new Vision.ImageAnnotatorClient({
  keyFilename: config.credentials,
  projectId: config.projectId
});

export const { bucketName } = config;
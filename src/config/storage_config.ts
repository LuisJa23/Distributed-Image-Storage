import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.KEYFILENAME
});

export const bucketName = process.env.BUCKET_NAME || 'default-bucket-name';
export const storageClient = storage;
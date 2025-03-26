// src/config/storage_config.ts
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

export const storageClient = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.KEYFILENAME
});

import { Request } from 'express';

/**
 * Interfaz MulterRequest: Extiende la interfaz Request de Express para incluir
 * la propiedad opcional "file" que representa el archivo subido mediante Multer.
 */
export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

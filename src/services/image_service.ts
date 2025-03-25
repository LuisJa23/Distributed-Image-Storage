import { StorageService } from './storage_service';

export class ImageService {
  static async uploadImage(filePath: string) {
    return await StorageService.uploadImage(filePath);
  }

  static async deleteImage(fileName: string) {
    return await StorageService.deleteImage(fileName);
  }
}
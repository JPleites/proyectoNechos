import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'productos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});
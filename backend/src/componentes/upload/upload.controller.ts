import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from '../../cloudinary/cloudinary.storage';

@Controller('upload')
export class UploadController {
  @Post('imagen')
  @UseInterceptors(FileInterceptor('file', { storage }))
  subirImagen(@UploadedFile() file: Express.Multer.File) {
    return {
      url: file.path,
    };
  }
}

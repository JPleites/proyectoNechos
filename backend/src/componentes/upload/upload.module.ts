import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadController } from './upload.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}

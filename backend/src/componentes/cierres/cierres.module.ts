import { Module } from '@nestjs/common';
import { CierresController } from './cierres.controller';
import { CierresService } from './cierres.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CierresController],
  providers: [CierresService],
})
export class CierresModule {}
import { Module } from '@nestjs/common';
import { AlmacenesController } from './almacenes.controller';
import { AlmacenesService } from './almacenes.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AlmacenesController],
  providers: [AlmacenesService],
})
export class AlmacenesModule {}
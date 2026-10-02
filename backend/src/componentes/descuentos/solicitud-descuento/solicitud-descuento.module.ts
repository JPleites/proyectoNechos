import { Module } from '@nestjs/common';
import { SolicitudDescuentoController } from './solicitud-descuento.controller';
import { SolicitudDescuentoService } from './solicitud-descuento.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SolicitudDescuentoController],
  providers: [SolicitudDescuentoService],
  exports: [SolicitudDescuentoService],
})
export class SolicitudDescuentoModule {}

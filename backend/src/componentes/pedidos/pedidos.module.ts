import { Module } from '@nestjs/common';

import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SolicitudDescuentoModule } from '../descuentos/solicitud-descuento/solicitud-descuento.module';

@Module({
  imports: [PrismaModule, SolicitudDescuentoModule],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidoModule {}

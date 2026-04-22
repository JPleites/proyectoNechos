import { Module } from '@nestjs/common';
import { MovimientosinventarioService } from './movimientosinventario.service';
import { MovimientosinventarioController } from './movimientosinventario.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    controllers: [MovimientosinventarioController],
    providers: [MovimientosinventarioService],
    imports: [PrismaModule]
})
export class MovimientosinventarioModule {}

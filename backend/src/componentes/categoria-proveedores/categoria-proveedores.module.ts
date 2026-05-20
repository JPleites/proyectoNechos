import { Module } from '@nestjs/common';
import { CategoriaProveedoresService } from './categoria-proveedores.service';
import { CategoriaProveedoresController } from './categoria-proveedores.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CategoriaProveedoresService],
  controllers: [CategoriaProveedoresController]
})
export class CategoriaProveedoresModule {}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CategoriaProveedoresService } from './categoria-proveedores.service';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('categoria-proveedores')
export class CategoriaProveedoresController {
  constructor(
    private readonly CategoriaProveedoresService: CategoriaProveedoresService,
  ) {}

  @Get(':rtn')
  getByProveedor(@Param('rtn') rtn: string) {
    return this.CategoriaProveedoresService.getByProveedor(rtn);
  }

  @Post()
  asignar(@Body() data: { proveedorRtn: string; categorias: string[] }) {
    return this.CategoriaProveedoresService.asignarCategorias(
      data.proveedorRtn,
      data.categorias,
    );
  }
}

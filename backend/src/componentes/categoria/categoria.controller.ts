import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('categorias')
export class CategoriaController {
  constructor(private readonly service: CategoriaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('admin', 'supervisor')
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Roles('admin', 'supervisor')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Roles('admin', 'supervisor')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Roles('admin', 'supervisor')
  @Post(':id/proveedores')
  asignarProveedor(
    @Param('id') id: string,
    @Body() body: { proveedorRtn: string },
  ) {
    return this.service.asignarProveedor(id, body.proveedorRtn);
  }

  @Roles('admin', 'supervisor')
  @Delete(':id/proveedores/:rtn')
  quitarProveedor(@Param('id') id: string, @Param('rtn') rtn: string) {
    return this.service.quitarProveedor(id, rtn);
  }
}

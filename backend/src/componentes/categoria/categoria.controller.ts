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

  @Get('subcategorias/todas')
  findTodasSubCategorias() {
    return this.service.findSubCategorias(0); // o crea un método findAll
  }

  @Get(':id/subcategorias')
  findSubCategorias(@Param('id') id: string) {
    return this.service.findSubCategorias(Number(id));
  }

  @Roles('admin', 'supervisor')
  @Post(':id/subcategorias')
  createSubCategoria(@Param('id') id: string, @Body() data: any) {
    return this.service.createSubCategoria({
      ...data,
      categoriaId: Number(id),
    });
  }

  @Roles('admin', 'supervisor')
  @Delete('subcategorias/:subId')
  deleteSubCategoria(@Param('subId') subId: string) {
    return this.service.deleteSubCategoria(Number(subId));
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Roles('admin', 'supervisor')
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Roles('admin', 'supervisor')
  @Put(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Roles('admin', 'supervisor')
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.delete(Number(id));
  }

  @Roles('admin', 'supervisor')
  @Post(':id/proveedores')
  asignarProveedor(
    @Param('id') id: number,
    @Body() body: { proveedorRtn: number },
  ) {
    return this.service.asignarProveedor(id, body.proveedorRtn);
  }

  @Roles('admin', 'supervisor')
  @Delete(':id/proveedores/:rtn')
  quitarProveedor(@Param('id') id: number, @Param('rtn') rtn: number) {
    return this.service.quitarProveedor(id, rtn);
  }
}

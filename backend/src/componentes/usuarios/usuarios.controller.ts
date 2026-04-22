import {
  Controller, Get,Post, Body, Param, Delete, Put, UseGuards
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('usuarios')
@UseGuards(AuthGuard, RolesGuard)
// Solo los usuarios con rol 'admin' o 'supervisor' pueden acceder a las rutas de este controlador
@Roles('admin', 'supervisor')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.usuarios({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.usuario({
      codigo: Number(id),
    });
  }

  @Post()
  create(@Body() data: any) {
    return this.usuariosService.createUsuarios(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.deleteUsuarios({
      codigo: Number(id),
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.usuariosService.updateUsuarios({
      where: { codigo: Number(id) },
      data,
    });
  }
}

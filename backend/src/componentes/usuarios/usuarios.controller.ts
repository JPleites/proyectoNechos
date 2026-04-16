import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
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
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
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

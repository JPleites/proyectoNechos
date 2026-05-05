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
import { UbicacionesService } from './ubicaciones.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('ubicaciones')
export class UbicacionesController {
  constructor(private readonly service: UbicacionesService) {}

  // 📋 Listar
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // 🔍 Obtener uno
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ➕ Crear
  @Roles('admin', 'supervisor')
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  // ✏️ Actualizar
  @Roles('admin', 'supervisor')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  // ❌ Eliminar
  @Roles('admin', 'supervisor')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
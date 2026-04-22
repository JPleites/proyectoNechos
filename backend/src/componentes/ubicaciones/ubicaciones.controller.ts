import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UbicacionesService } from './ubicaciones.service';

@Controller('ubicaciones')
export class UbicacionesController {
  constructor(private readonly ubicacionesService: UbicacionesService) {}

  @Get()
  findAll() {
    return this.ubicacionesService.ubicaciones({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
  return this.ubicacionesService.ubicacion({
    ubicacion: id,
  });
}

  @Post()
  create(@Body() data: any) {
    return this.ubicacionesService.createUbicaciones(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.ubicacionesService.updateUbicaciones({
      where: { ubicacion: id },
      data,
    });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.ubicacionesService.deleteUbicaciones({
      ubicacion: id,
    });
  }
  
}

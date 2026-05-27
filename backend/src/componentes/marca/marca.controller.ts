import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MarcaService } from './marca.service';
import { CreateMarcaDto } from './dto/create-marca.dto';

@Controller('marcas')
export class MarcaController {
  constructor(private service: MarcaService) {}

  @Post()
  create(@Body() dto: CreateMarcaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('proveedor/:id')
  findByProveedor(@Param('id') id: string) {
    return this.service.findByProveedor(Number(id));
  }
}
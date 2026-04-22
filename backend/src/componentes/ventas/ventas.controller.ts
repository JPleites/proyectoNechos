import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('ventas')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'supervisor', 'vendedor')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get()
  findAll() {
    return this.ventasService.findAll({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne({
      id: Number(id),
    });
  }

  @Post()
  create(@Body() data: any) {
    return this.ventasService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.ventasService.update({
      where: { id: Number(id) },
      data,
    });
  }

  @Put(':id/finalizar')
  finalizarVenta(
    @Param('id') id: string,
    @Body() body: { usuarioCodigo: number },
  ) {
    return this.ventasService.finalizarVenta(Number(id), body.usuarioCodigo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ventasService.delete({
      id: Number(id),
    });
  }
}

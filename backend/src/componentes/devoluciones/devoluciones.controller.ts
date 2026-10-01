import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { DevolucionesService } from './devoluciones.service';
import { CrearDevolucionDto } from './dto/crear-devolucion.dto';

import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('devoluciones')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'supervisor', 'cajero')
export class DevolucionesController {
  constructor(private readonly devolucionesService: DevolucionesService) {}

  @Post()
  crearDevolucion(@Body() data: CrearDevolucionDto, @Req() req: any) {
    return this.devolucionesService.crearDevolucion(data, req.user.sub);
  }

  @Get()
  obtenerDevoluciones() {
    return this.devolucionesService.obtenerDevoluciones();
  }

  @Get('consulta')
  consultarDevoluciones(@Req() req: any) {
    return this.devolucionesService.consultarDevoluciones({
      devolucionID: req.query.devolucionID,
      ventaID: req.query.ventaID,
      cliente: req.query.cliente,
      producto: req.query.producto,
      fechaDesde: req.query.fechaDesde,
      fechaHasta: req.query.fechaHasta,
      fueUsada: req.query.fueUsada,
    });
  }

  @Get(':devolucionID')
  obtenerDevolucion(@Param('devolucionID') devolucionID: string) {
    return this.devolucionesService.obtenerDevolucion(devolucionID);
  }
}

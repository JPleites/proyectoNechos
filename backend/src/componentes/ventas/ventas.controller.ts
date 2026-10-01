import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('ventas')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'supervisor', 'cajero')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get('consulta')
  consultarVentas(@Req() req: any) {
    return this.ventasService.consultarVentas({
      ventaID: req.query.ventaID,
      cliente: req.query.cliente,
      fechaDesde: req.query.fechaDesde,
      fechaHasta: req.query.fechaHasta,
      estado: req.query.estado,
      tipoVenta: req.query.tipoVenta,
      metodoPago: req.query.metodoPago,
    });
  }

  @Get(':id/devolucion')
  obtenerVentaParaDevolucion(@Param('id') id: string) {
    return this.ventasService.obtenerVentaParaDevolucion(Number(id));
  }
  // ✅ facturar
  @Post(':id/facturar')
  facturar(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    console.log('usuario en token:', req.user);
    return this.ventasService.facturarPedido(Number(id), data, req.user.sub);
  }
}

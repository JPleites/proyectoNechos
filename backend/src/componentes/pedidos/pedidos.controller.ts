import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';

import { PedidosService } from './pedidos.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { AgregarPedidoDetalleDto } from './dto/agregar-pedido-detalle.dto';
import { ActualizarPedidoDetalleDto } from './dto/actualizar-pedido-detalle.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  // ==========================================
  // CREAR PEDIDO
  // ==========================================

  @Roles('admin', 'supervisor', 'vendedor')
  @Post()
  crearPedido(@Body() data: CrearPedidoDto, @Req() req: any) {
    return this.service.crearPedido(data, req.user.sub);
  }

  // ==========================================
  // LISTAR
  // ==========================================

  @Roles('admin', 'supervisor', 'vendedor', 'cajero')
  @Get()
  listar() {
    return this.service.listarPedidos();
  }

  // ==========================================
  // PEDIDOS EN CAJA
  // ==========================================

  @Roles('admin', 'supervisor', 'cajero')
  @Get('en-caja')
  findEnCaja() {
    return this.service.listarPedidosEnCaja();
  }

  // ==========================================
  // OBTENER UNO
  // ==========================================

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.service.obtenerPedido(Number(id));
  }

  // ==========================================
  // AGREGAR PRODUCTO
  // ==========================================

  @Roles('admin', 'supervisor', 'vendedor')
  @Post(':id/detalle')
  agregar(@Param('id') id: string, @Body() data: AgregarPedidoDetalleDto) {
    return this.service.agregarProducto(Number(id), data);
  }

  // ==========================================
  // ACTUALIZAR CANTIDAD
  // ==========================================

  @Roles('admin', 'supervisor', 'vendedor')
  @Put('detalle/:detalleId')
  actualizarDetalle(
    @Param('detalleId') detalleId: string,
    @Body() data: ActualizarPedidoDetalleDto,
  ) {
    return this.service.actualizarDetalle(Number(detalleId), data.cantidad);
  }

  // ==========================================
  // ELIMINAR DETALLE
  // ==========================================

  @Roles('admin', 'supervisor', 'vendedor')
  @Delete('detalle/:detalleId')
  eliminarDetalle(@Param('detalleId') detalleId: string) {
    return this.service.eliminarDetalle(Number(detalleId));
  }

  // ==========================================
  // ENVIAR A CAJA
  // ==========================================

  @Roles('admin', 'supervisor', 'vendedor')
  @Put(':id/caja')
  enviarACaja(@Param('id') id: string) {
    return this.service.enviarACaja(Number(id));
  }

  // ==========================================
  // CANCELAR
  // ==========================================

  @Roles('admin', 'supervisor', 'vendedor', 'cajero')
  @Delete(':id')
  cancelar(@Param('id') id: string) {
    return this.service.cancelarPedido(Number(id));
  }
}

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
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  // 🟢 crear pedido
  @Roles('admin', 'supervisor', 'vendedor')
  @Post()
  crear(@Body() data: any) {
    return this.service.crearPedido(data);
  }

  // 📋 listar
  @Roles('admin', 'supervisor', 'vendedor', 'cajero')
  @Get()
  listar() {
    return this.service.listarPedidos();
  }

  @Get('en-caja')
  findEnCaja() {
    return this.service.listarPedidosEnCaja();
  }

  // 🔍 ver uno
  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.service.obtenerPedido(Number(id));
  }

  // ➕ agregar producto
  @Post(':id/detalle')
  agregar(@Param('id') id: string, @Body() data: any) {
    return this.service.agregarProducto(Number(id), data);
  }

  // 🔄 enviar a caja
  @Put(':id/caja')
  enviarACaja(@Param('id') id: string) {
    return this.service.enviarACaja(Number(id));
  }

  // ❌ cancelar
  @Delete(':id')
  cancelar(@Param('id') id: string) {
    return this.service.cancelarPedido(Number(id));
  }
}

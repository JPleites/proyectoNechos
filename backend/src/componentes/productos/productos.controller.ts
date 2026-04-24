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
import { ProductosService } from './productos.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Roles('admin', 'supervisor', 'cajero', 'vendedor')
  @Get()
  findAll() {
    return this.productosService.productos({});
  }

  @Roles('admin', 'supervisor', 'cajero', 'vendedor')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.producto({
      codigo: id,
    });
  }

  @Roles('admin', 'supervisor')
  @Post()
  create(@Body() data: any) {
    return this.productosService.createProductos(data);
  }

  @Roles('admin', 'supervisor')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.deleteProductos({
      codigo: id,
    });
  }

  @Roles('admin', 'supervisor')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.productosService.updateProductos({
      where: { codigo: id },
      data,
    });
  }

  @Get('buscar')
  buscar(@Query('q') q: string) {
    return this.productosService.buscarProductos(q);
  }

  // Nuevo endpoint para obtener el inventario de un producto
  @Get(':id/inventario')
  getInventario(@Param('id') id: string) {
    return this.productosService.productoConInventario(id);
  }
}

import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('productos')
export class ProductosController {
    constructor(private readonly productosService: ProductosService) {}

    @Get()
    findAll() {
        return this.productosService.productos({});
    }

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
    
    @Roles('admin', 'supervisor', 'cajero')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.productosService.updateProductos({
            where: { codigo: id },
            data,
        });
    }
}

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProductosService } from './productos.service';

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

    @Post()
    create(@Body() data: any) {
        return this.productosService.createProductos(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productosService.deleteProductos({
            codigo: id,
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.productosService.updateProductos({
            where: { codigo: id },
            data,
        });
    }
}

import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { InventarioService } from './inventario.service';

@Controller('inventario')
export class InventarioController {
    constructor(private readonly inventarioService: InventarioService) {}

    @Get()
    findAll() {
        return this.inventarioService.inventarios({});
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.inventarioService.inventario({
            id: Number(id),
        });
    }

    @Post()
    create(@Body() data: any) {
        return this.inventarioService.createInventario(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.inventarioService.deleteInventario({
            id: Number(id),
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.inventarioService.updateInventario({
            where: { id: Number(id) },
            data,
        });
    }
}

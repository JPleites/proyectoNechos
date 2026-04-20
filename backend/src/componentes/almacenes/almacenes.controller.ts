import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { AlmacenesService } from './almacenes.service';

@Controller('almacenes')
export class AlmacenesController {
    constructor(private readonly almacenesService: AlmacenesService) {}

    @Get()
    findAll() {
        return this.almacenesService.almacenes({});
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.almacenesService.almacen({
            id: id,
        });
    }

    @Post()
    create(@Body() data: any) {
        return this.almacenesService.createAlmacenes(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.almacenesService.deleteAlmacenes({
            id: id,
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.almacenesService.updateAlmacenes({
            where: { id: id },
            data,
        });
    }
}

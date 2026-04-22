import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { AlmacenesService } from './almacenes.service';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)

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

    @Roles('admin', 'supervisor')
    @Post()
    create(@Body() data: any) {
        return this.almacenesService.createAlmacenes(data);
    }
    
    @Roles('admin', 'supervisor')
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

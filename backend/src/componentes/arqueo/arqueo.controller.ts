import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ArqueoService } from './arqueo.service';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)

@Controller('arqueo')
export class ArqueoController {
    constructor(private readonly arqueoService: ArqueoService) {}

    @Roles('admin', 'supervisor')
    @Get()
    findAll() {
        return this.arqueoService.arqueos({});
    }

    @Roles('admin', 'supervisor')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.arqueoService.arqueo({
            id: Number(id),
        });
    }

    @Roles('admin', 'supervisor', 'cajero')
    @Post()
    create(@Body() data: any) {
        return this.arqueoService.createArqueo(data);
    }

    @Roles('admin', 'supervisor')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.arqueoService.deleteArqueo({
            id: Number(id),
        });
    }

    @Roles('admin', 'supervisor')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.arqueoService.updateArqueo({
            where: { id: Number(id) },
            data,
        });
    }
}

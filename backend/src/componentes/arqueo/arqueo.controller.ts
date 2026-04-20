import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ArqueoService } from './arqueo.service';

@Controller('arqueo')
export class ArqueoController {
    constructor(private readonly arqueoService: ArqueoService) {}

    @Get()
    findAll() {
        return this.arqueoService.arqueos({});
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.arqueoService.arqueo({
            id: Number(id),
        });
    }

    @Post()
    create(@Body() data: any) {
        return this.arqueoService.createArqueo(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.arqueoService.deleteArqueo({
            id: Number(id),
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.arqueoService.updateArqueo({
            where: { id: Number(id) },
            data,
        });
    }
}

import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CierresService } from './cierres.service';

@Controller('cierres')
export class CierresController {
    constructor(private readonly cierresService: CierresService) {}

    @Get()
    findAll() {
        return this.cierresService.cierres({});
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cierresService.cierre({
            id: Number(id),
        });
    }

    @Post()
    create(@Body() data: any) {
        return this.cierresService.createCierres(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cierresService.deleteCierres({
            id: Number(id),
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.cierresService.updateCierres({
            where: { id: Number(id) },
            data,
        });
    }
}

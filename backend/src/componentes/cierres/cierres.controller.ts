import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CierresService } from './cierres.service';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)

@Controller('cierres')
export class CierresController {
    constructor(private readonly cierresService: CierresService) {}

    @Roles('admin', 'supervisor')
    @Get()
    findAll() {
        return this.cierresService.cierres({});
    }

    @Roles('admin', 'supervisor')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cierresService.cierre({
            id: Number(id),
        });
    }

    @Roles('admin', 'supervisor', 'cajero')
    @Post()
    create(@Body() data: any) {
        return this.cierresService.createCierres(data);
    }

    @Roles('admin', 'supervisor')
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

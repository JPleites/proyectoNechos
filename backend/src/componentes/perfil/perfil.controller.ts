import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PerfilService } from './perfil.service';import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)

@Controller('perfil')
@Roles('admin', 'supervisor')
export class PerfilController {
    constructor(private readonly perfilService: PerfilService) {}

    @Get()
    findAll() {
        return this.perfilService.perfiles({});
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.perfilService.perfil({
            id: Number(id),
        });
    }

    @Post()
    create(@Body() data: any) {
        return this.perfilService.createPerfil(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.perfilService.deletePerfil({
            id: Number(id),
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.perfilService.updatePerfil({
            where: { id: Number(id) },
            data,
        });
    }
}

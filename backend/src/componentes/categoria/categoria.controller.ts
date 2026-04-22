import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)

@Roles('admin', 'supervisor')
@Controller('categoria')
export class CategoriaController {
    constructor(private readonly categoriaService: CategoriaService) {}

    @Get()
    findAll() {
        return this.categoriaService.categorias({});
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriaService.categoria({
            id: id,
        });
    }

    @Post()
    create(@Body() data: any) {
        return this.categoriaService.createCategoria(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriaService.deleteCategoria({
            id: id,
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.categoriaService.updateCategoria({
            where: { id: id },
            data,
        });
    }
}

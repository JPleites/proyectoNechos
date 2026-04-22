import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('clientes')


export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Roles('admin', 'supervisor', 'vendedor', 'cajero')
    @Get()
    findAll() {
        return this.clientesService.clientes({});
    }

    @Roles('admin', 'supervisor', 'vendedor', 'cajero')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clientesService.cliente({
            id: id,
        });
    }

    @Roles('admin', 'supervisor', 'vendedor', 'cajero')
    @Post()
    create(@Body() data: any) {
        return this.clientesService.createClientes(data);
    }

    @Roles('admin', 'supervisor')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clientesService.deleteClientes({
            id: id,
        });
    }

    @Roles('admin', 'supervisor')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.clientesService.updateClientes({
            where: { id: id },
            data,
        });
    }
}

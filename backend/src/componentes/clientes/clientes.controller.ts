import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Get()
    findAll() {
        return this.clientesService.clientes({});
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clientesService.cliente({
            id: id,
        });
    }

    @Post()
    create(@Body() data: any) {
        return this.clientesService.createClientes(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clientesService.deleteClientes({
            id: id,
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.clientesService.updateClientes({
            where: { id: id },
            data,
        });
    }
}

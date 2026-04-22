import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)

@Controller('proveedores')

@Roles('admin', 'supervisor')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Get()
  findAll() {
    return this.proveedoresService.proveedores({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedoresService.proveedor({
      rtn: id,
    });
  }

  @Post()
  create(@Body() data: any) {
    return this.proveedoresService.createProveedores(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.proveedoresService.updateProveedores({
        where: { rtn: id },
        data,
    });
  }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.proveedoresService.deleteProveedores({
            rtn: id,
        });
    }
}

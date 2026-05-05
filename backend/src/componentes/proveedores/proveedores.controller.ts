import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly service: ProveedoresService) {}

  @Get()
  findAll() {
    return this.service.proveedores();
  }

  @Get(':rtn')
  findOne(@Param('rtn') rtn: string) {
    return this.service.proveedor({ rtn });
  }

  @Roles('admin', 'supervisor')
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Roles('admin', 'supervisor')
  @Put(':rtn')
  update(@Param('rtn') rtn: string, @Body() data: any) {
    return this.service.update({
      where: { rtn },
      data,
    });
  }

  @Roles('admin', 'supervisor')
  @Delete(':rtn')
  delete(@Param('rtn') rtn: string) {
    return this.service.delete({ rtn });
  }
}
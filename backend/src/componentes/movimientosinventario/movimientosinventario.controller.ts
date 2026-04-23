import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MovimientosinventarioService } from './movimientosinventario.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('movimientosinventario')
export class MovimientosinventarioController {
    constructor(private readonly movimientosService: MovimientosinventarioService) {}

  @Get()
  findAll(
    @Query() query: { skip?: string; take?: string },
  ) {
    return this.movimientosService.findAll({
      skip: query.skip ? Number(query.skip) : undefined,
      take: query.take ? Number(query.take) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosService.findOne(Number(id));
  }

  // @Post()
  // create(@Body() data: any) {
  //   return this.movimientosService.create(data);
  // }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('ventas')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'supervisor', 'cajero')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

    // ✅ facturar
  @Post(':id/facturar')
  facturar(@Param('id') id: string, @Body() data: any) {
    return this.ventasService.facturarPedido(Number(id), data);
  }
}

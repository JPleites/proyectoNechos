import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
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
  facturar(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    console.log('usuario en token:', req.user); // 👈 Ver el contenido del token
    return this.ventasService.facturarPedido(
      Number(id),
      data,
      req.user.sub, // 👈 cajero del token
    );
  }
}

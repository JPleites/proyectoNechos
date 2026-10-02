import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SolicitudDescuentoService } from './solicitud-descuento.service';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('solicitudes-descuento')
@UseGuards(AuthGuard, RolesGuard)
export class SolicitudDescuentoController {
  constructor(
    private readonly solicitudDescuentoService: SolicitudDescuentoService,
  ) {}

  // =========================================================
  // LISTAR SOLICITUDES PENDIENTES
  // =========================================================
  @Get('pendientes')
  @Roles('admin', 'supervisor')
  async listarPendientes() {
    return this.solicitudDescuentoService.listarPendientes();
  }

  // =========================================================
  // OBTENER SOLICITUD
  // =========================================================
  @Get(':id')
  @Roles('admin', 'supervisor')
  async obtenerSolicitud(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudDescuentoService.obtenerSolicitud(id);
  }

  // =========================================================
  // APROBAR SOLICITUD
  // =========================================================
  @Post(':id/aprobar')
  @Roles('admin', 'supervisor')
  async aprobarSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const usuarioCodigo = req.user.codigo;
    const rol = req.user.rol;

    return this.solicitudDescuentoService.aprobarSolicitud(
      id,
      usuarioCodigo,
      rol,
    );
  }

  // =========================================================
  // RECHAZAR SOLICITUD
  // =========================================================
  @Post(':id/rechazar')
  @Roles('admin', 'supervisor')
  async rechazarSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string | undefined,
    @Req() req: any,
  ) {
    const usuarioCodigo = req.user.codigo;
    const rol = req.user.rol;

    return this.solicitudDescuentoService.rechazarSolicitud(
      id,
      usuarioCodigo,
      rol,
      motivo,
    );
  }
}

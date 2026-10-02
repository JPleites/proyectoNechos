import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SolicitudDescuentoService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // LISTAR SOLICITUDES PENDIENTES
  // =========================================================
  async listarPendientes() {
    return this.prisma.solicitudDescuento.findMany({
      where: {
        estado: 'PENDIENTE',
      },
      include: {
        producto: {
          select: {
            codigo: true,
            producto: true,
            precio: true,
          },
        },
        pedido: {
          select: {
            pedidoID: true,
            clienteID: true,
            estado: true,
          },
        },
        vendedor: {
          select: {
            codigo: true,
            perfil: {
              select: {
                nombre: true,
              },
            },
          },
        },
        pedidoDetalle: {
          select: {
            id: true,
            cantidad: true,
            ubicacion: true,
          },
        },
      },
      orderBy: {
        fecha: 'asc',
      },
    });
  }

  // =========================================================
  // OBTENER UNA SOLICITUD
  // =========================================================
  async obtenerSolicitud(id: number) {
    const solicitud = await this.prisma.solicitudDescuento.findUnique({
      where: { id },
      include: {
        producto: true,
        pedido: true,
        vendedor: {
          include: {
            perfil: true,
          },
        },
        pedidoDetalle: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException('La solicitud de descuento no existe');
    }

    return solicitud;
  }

  // =========================================================
  // APROBAR SOLICITUD
  // =========================================================
  async aprobarSolicitud(id: number, usuarioCodigo: number, rol: string) {
    return this.prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitudDescuento.findUnique({
        where: { id },
        include: {
          pedido: true,
        },
      });

      if (!solicitud) {
        throw new NotFoundException('La solicitud de descuento no existe');
      }

      if (solicitud.estado !== 'PENDIENTE') {
        throw new BadRequestException(
          `La solicitud ya fue ${solicitud.estado.toLowerCase()}`,
        );
      }

      // El pedido debe seguir esperando aprobación.
      if (solicitud.pedido.estado !== 'PENDIENTE_APROBACION') {
        throw new BadRequestException(
          'El pedido ya no está pendiente de aprobación',
        );
      }

      // Solicitudes ADMIN solamente pueden ser aprobadas por ADMIN.
      if (solicitud.nivelAprobacion === 'ADMIN' && rol !== 'admin') {
        throw new ForbiddenException(
          'Esta solicitud requiere aprobación de un administrador',
        );
      }

      // SUPERVISOR_ADMIN puede aprobarla supervisor o admin.
      if (
        solicitud.nivelAprobacion === 'SUPERVISOR_ADMIN' &&
        rol !== 'admin' &&
        rol !== 'supervisor'
      ) {
        throw new ForbiddenException(
          'No tienes permisos para aprobar esta solicitud',
        );
      }

      // Aprobar solicitud.
      const solicitudActualizada = await tx.solicitudDescuento.update({
        where: { id },
        data: {
          estado: 'APROBADA',
          resueltoPorCodigo: usuarioCodigo,
        },
      });

      // Revisar solicitudes restantes del pedido.
      const pendientes = await tx.solicitudDescuento.count({
        where: {
          pedidoId: solicitud.pedidoId,
          estado: 'PENDIENTE',
        },
      });

      const rechazadas = await tx.solicitudDescuento.count({
        where: {
          pedidoId: solicitud.pedidoId,
          estado: 'RECHAZADA',
        },
      });

      // Solo si TODAS están aprobadas.
      if (pendientes === 0 && rechazadas === 0) {
        await tx.pedidos.update({
          where: {
            id: solicitud.pedidoId,
          },
          data: {
            aprobado: true,
            estado: 'EN_PROCESO',
          },
        });
      }

      return solicitudActualizada;
    });
  }

  // =========================================================
  // RECHAZAR SOLICITUD
  // =========================================================
  async rechazarSolicitud(
    id: number,
    usuarioCodigo: number,
    rol: string,
    motivo?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitudDescuento.findUnique({
        where: { id },
      });

      if (!solicitud) {
        throw new NotFoundException('La solicitud de descuento no existe');
      }

      if (solicitud.estado !== 'PENDIENTE') {
        throw new BadRequestException(
          `La solicitud ya fue ${solicitud.estado.toLowerCase()}`,
        );
      }

      // Validar permisos según nivel de aprobación
      if (solicitud.nivelAprobacion === 'ADMIN' && rol !== 'admin') {
        throw new ForbiddenException(
          'Esta solicitud solo puede ser rechazada por un administrador',
        );
      }

      if (
        solicitud.nivelAprobacion === 'SUPERVISOR_ADMIN' &&
        rol !== 'admin' &&
        rol !== 'supervisor'
      ) {
        throw new ForbiddenException(
          'No tienes permisos para rechazar esta solicitud',
        );
      }

      // Marcar solicitud como rechazada
      const solicitudActualizada = await tx.solicitudDescuento.update({
        where: { id },
        data: {
          estado: 'RECHAZADA',
          motivo: motivo?.trim() || null,
          resueltoPorCodigo: usuarioCodigo,
        },
      });

      // Obtener todos los detalles del pedido
      const detalles = await tx.pedidoDetalle.findMany({
        where: {
          pedidoID: solicitud.pedidoId,
        },
      });

      // Liberar las reservas
      for (const detalle of detalles) {
        const inventario = await tx.inventario.findUnique({
          where: {
            productoCodigo_ubicacion: {
              productoCodigo: detalle.productoCodigo,
              ubicacion: detalle.ubicacion,
            },
          },
        });

        if (inventario) {
          const cantidadReservada = Number(inventario.cantidadReservada ?? 0);

          const nuevaReserva = Math.max(
            cantidadReservada - detalle.cantidad,
            0,
          );

          await tx.inventario.update({
            where: {
              id: inventario.id,
            },
            data: {
              cantidadReservada: nuevaReserva,
            },
          });
        }
      }

      // Cancelar el pedido
      await tx.pedidos.update({
        where: {
          id: solicitud.pedidoId,
        },
        data: {
          estado: 'CANCELADO',
          aprobado: false,
        },
      });

      return solicitudActualizada;
    });
  }
}

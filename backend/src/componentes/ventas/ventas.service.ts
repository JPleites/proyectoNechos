import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeneradorCodigoService } from '../../common/services/generador-codigo/generador-codigo.service';

@Injectable()
export class VentasService {
  constructor(
    private readonly prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  async generarPedidoID() {
    const last = await this.prisma.pedidos.findFirst({
      orderBy: { id: 'desc' },
    });

    const nextNumber = last ? last.id + 1 : 1;
    return this.codeGen.generate('PED', nextNumber);
  }

  // =========================================================
  // FACTURAR PEDIDO
  // =========================================================
  async facturarPedido(id: number, data: any, cajeroCodigo: number) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: { id },
      include: {
        detalles: {
          include: {
            producto: true,
            ubicacionRel: true,
          },
        },
        usuario: {
          include: {
            perfil: true,
          },
        },
      },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    if (pedido.estado !== 'EN_CAJA') {
      throw new BadRequestException('El pedido no está en caja');
    }

    if (!pedido.detalles.length) {
      throw new BadRequestException('El pedido no tiene productos');
    }

    // =====================================================
    // VALIDAR DATOS DE PAGO
    // =====================================================

    if (!data.metodoPago) {
      throw new BadRequestException('El método de pago es obligatorio');
    }

    if (
      data.totalRecibido === undefined ||
      data.totalRecibido === null ||
      Number(data.totalRecibido) < Number(pedido.total)
    ) {
      throw new BadRequestException(
        'El monto recibido no puede ser menor que el total',
      );
    }

    // =====================================================
    // GENERAR ID DE VENTA
    // =====================================================

    const lastVenta = await this.prisma.ventas.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    const ventaID = this.codeGen.generate(
      'V',
      lastVenta ? lastVenta.id + 1 : 1,
    );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // =====================================================
    // TRANSACCIÓN COMPLETA
    // =====================================================

    return this.prisma.$transaction(async (tx) => {
      // ===================================================
      // 1. VALIDAR INVENTARIO Y RESERVAS
      // ===================================================

      for (const detalle of pedido.detalles) {
        const inventario = await tx.inventario.findUnique({
          where: {
            productoCodigo_ubicacion: {
              productoCodigo: detalle.productoCodigo,
              ubicacion: detalle.ubicacion,
            },
          },
        });

        if (!inventario) {
          throw new BadRequestException(
            `No existe inventario para ${detalle.productoCodigo} en ${detalle.ubicacion}`,
          );
        }

        const cantidadReservada = inventario.cantidadReservada ?? 0;

        /*
         * El pedido ya debería tener reservado este producto.
         *
         * Validamos que exista suficiente reserva para cubrir
         * la cantidad que estamos intentando facturar.
         */
        if (cantidadReservada < detalle.cantidad) {
          throw new BadRequestException(
            `La reserva de ${detalle.productoCodigo} en ${detalle.ubicacion} no es suficiente. ` +
              `Reservado: ${cantidadReservada}, requerido: ${detalle.cantidad}`,
          );
        }

        /*
         * También validamos que físicamente exista suficiente
         * inventario.
         */
        if (inventario.cantidad < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${detalle.productoCodigo} en ${detalle.ubicacion}`,
          );
        }
      }

      // ===================================================
      // 2. CREAR VENTA
      // ===================================================

      const venta = await tx.ventas.create({
        data: {
          ventaID,
          clienteID: pedido.clienteID,
          fecha: new Date(),
          estado: 'FACTURADA',
          tipoVenta: 'CONTADO',
          subtotal: pedido.subtotal,
          impuesto: pedido.impuesto,
          descuento: pedido.descuento,
          total: pedido.total,
          metodoPago: data.metodoPago,
          totalRecibido: data.totalRecibido,
          cambio: Number(data.totalRecibido) - Number(pedido.total),
          usuarioCodigo: cajeroCodigo,

          detalles: {
            create: pedido.detalles.map((d) => ({
              productoCodigo: d.productoCodigo,
              nombreProducto: d.producto.producto,
              cantidad: d.cantidad,
              precioUnitario: d.precioUnitario,
              subtotal: d.subtotal,
              descuento: d.descuento ?? 0,
            })),
          },
        },

        include: {
          cliente: true,
          usuario: {
            include: {
              perfil: true,
            },
          },
          detalles: true,
        },
      });

      // ===================================================
      // 3. CONVERTIR RESERVA EN SALIDA REAL
      // ===================================================

      for (const detalle of pedido.detalles) {
        const inventario = await tx.inventario.findUnique({
          where: {
            productoCodigo_ubicacion: {
              productoCodigo: detalle.productoCodigo,
              ubicacion: detalle.ubicacion,
            },
          },
        });

        if (!inventario) {
          throw new BadRequestException(
            `El inventario desapareció durante la facturación: ${detalle.productoCodigo}`,
          );
        }

        const cantidadReservada = inventario.cantidadReservada ?? 0;

        const nuevaCantidad = inventario.cantidad - detalle.cantidad;

        const nuevaCantidadReservada = cantidadReservada - detalle.cantidad;

        // ================================================
        // Si el stock queda en 0
        // ================================================

        if (nuevaCantidad === 0) {
          if (nuevaCantidadReservada !== 0) {
            throw new BadRequestException(
              `No se puede eliminar el inventario de ${detalle.productoCodigo} porque aún existen unidades reservadas`,
            );
          }

        } else {
          await tx.inventario.update({
            where: {
              id: inventario.id,
            },
            data: {
              cantidad: nuevaCantidad,
              cantidadReservada: nuevaCantidadReservada,
            },
          });
        }

        // ================================================
        // Registrar salida
        // ================================================

        await tx.movimientosInventario.create({
          data: {
            productoCodigo: detalle.productoCodigo,
            tipo: 'SALIDA',
            cantidad: detalle.cantidad,
            fecha: new Date(),
            referencia: venta.ventaID,
            usuarioCodigo: cajeroCodigo,
            ubicacion: detalle.ubicacion,
          },
        });
      }

      // ===================================================
      // 4. OBTENER / CREAR ARQUEO DEL DÍA
      // ===================================================

      let arqueo = await tx.arqueo.findFirst({
        where: {
          usuarioCodigo: cajeroCodigo,
          fecha: {
            gte: hoy,
          },
        },
      });

      if (!arqueo) {
        const lastArqueo = await tx.arqueo.findFirst({
          orderBy: {
            id: 'desc',
          },
        });

        arqueo = await tx.arqueo.create({
          data: {
            arqueoID: this.codeGen.generate(
              'ARQ',
              lastArqueo ? lastArqueo.id + 1 : 1,
            ),
            usuarioCodigo: cajeroCodigo,
            totalEfectivo: 0,
            totalBac: 0,
            totalFicohsa: 0,
            totalDavivienda: 0,
            totalTransferencias: 0,
            totalRetiros: 0,
            totalDevoluciones: 0,
            totalFacturado: 0,
          },
        });
      }

      // ===================================================
      // 5. ACTUALIZAR ARQUEO
      // ===================================================

      const total = Number(pedido.total);

      const campoMetodo: Record<string, string> = {
        EFECTIVO: 'totalEfectivo',
        BAC: 'totalBac',
        FICOHSA: 'totalFicohsa',
        DAVIVIENDA: 'totalDavivienda',
        TRANSFERENCIA: 'totalTransferencias',
      };

      const campo = campoMetodo[data.metodoPago];

      if (campo) {
        await tx.arqueo.update({
          where: {
            id: arqueo.id,
          },
          data: {
            [campo]: {
              increment: total,
            },
            totalFacturado: {
              increment: total,
            },
          },
        });
      }

      // ===================================================
      // 6. MARCAR PEDIDO COMO FACTURADO
      // ===================================================

      await tx.pedidos.update({
        where: {
          id,
        },
        data: {
          estado: 'FACTURADO',
        },
      });

      // ===================================================
      // 7. RESPUESTA
      // ===================================================

      return {
        ...venta,
        vendedor: pedido.usuario?.perfil?.nombre || 'N/A',
      };
    });
  }
}

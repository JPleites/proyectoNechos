import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Ventas } from '@prisma/client';
import { GeneradorCodigoService } from 'src/common/services/generador-codigo/generador-codigo.service';

@Injectable()
export class VentasService {
  constructor(
    private readonly prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  async generarPedidoID() {
    const last = await this.prisma.pedidos.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    const nextNumber = last ? last.id + 1 : 1;

    return this.codeGen.generate('PED', nextNumber);
  }

  // =========================================================
  // FACTURAR PEDIDO
  // =========================================================
  async facturarPedido(id: number, data: any) {
    return this.prisma.$transaction(async (tx) => {
      // ==========================================
      // OBTENER PEDIDO
      // ==========================================
      const pedido = await tx.pedidos.findUnique({
        where: {
          id,
        },
        include: {
          detalles: {
            include: {
              producto: true,
              ubicacionRel: true,
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

      // ==========================================
      // VALIDAR STOCK
      // ==========================================
      for (const detalle of pedido.detalles) {
        const inventario = await tx.inventario.findFirst({
          where: {
            productoCodigo: detalle.productoCodigo,
            ubicacion: detalle.ubicacion,
          },
        });

        if (!inventario) {
          throw new BadRequestException(
            `No existe inventario para ${detalle.productoCodigo}`,
          );
        }

        if (inventario.cantidad < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${detalle.productoCodigo}`,
          );
        }
      }

      // ==========================================
      // GENERAR VENTA ID
      // ==========================================
      const lastVenta = await tx.ventas.findFirst({
        orderBy: {
          id: 'desc',
        },
      });

      const ventaID = this.codeGen.generate(
        'V',
        lastVenta ? lastVenta.id + 1 : 1,
      );

      // ==========================================
      // CREAR VENTA
      // ==========================================
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

          usuarioCodigo: pedido.usuarioCodigo,

          detalles: {
            create: pedido.detalles.map((d) => ({
              productoCodigo: d.productoCodigo,
              nombreProducto: d.producto.producto,
              cantidad: d.cantidad,
              precioUnitario: d.precioUnitario,
              subtotal: d.subtotal,
              descuento: 0,
            })),
          },
        },
        include: {
          cliente: true,
          usuario: true,
          detalles: true,
        },
      });

      // ==========================================
      // DESCONTAR INVENTARIO
      // ==========================================
      for (const detalle of pedido.detalles) {
        const inventario = await tx.inventario.findFirst({
          where: {
            productoCodigo: detalle.productoCodigo,
            ubicacion: detalle.ubicacion,
          },
        });

        await tx.inventario.update({
          where: {
            id: inventario!.id,
          },
          data: {
            cantidad: {
              decrement: detalle.cantidad,
            },
          },
        });

        await tx.movimientosInventario.create({
          data: {
            productoCodigo: detalle.productoCodigo,
            tipo: 'SALIDA',
            cantidad: detalle.cantidad,
            fecha: new Date(),
            referencia: venta.ventaID,
            usuarioCodigo: pedido.usuarioCodigo,
          },
        });
      }

      // ==========================================
      // ACTUALIZAR ARQUEO
      // ==========================================
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      let arqueo = await tx.arqueo.findFirst({
        where: {
          usuarioCodigo: pedido.usuarioCodigo,
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

        const arqueoID = this.codeGen.generate(
          'ARQ',
          lastArqueo ? lastArqueo.id + 1 : 1,
        );

        arqueo = await tx.arqueo.create({
          data: {
            arqueoID,
            usuarioCodigo: pedido.usuarioCodigo,

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

      // ==========================================
      // SUMAR AL ARQUEO
      // ==========================================
      const total = Number(pedido.total);

      switch (data.metodoPago) {
        case 'EFECTIVO':
          await tx.arqueo.update({
            where: {
              id: arqueo.id,
            },
            data: {
              totalEfectivo: {
                increment: total,
              },
            },
          });
          break;

        case 'BAC':
          await tx.arqueo.update({
            where: {
              id: arqueo.id,
            },
            data: {
              totalBac: {
                increment: total,
              },
            },
          });
          break;

        case 'FICOHSA':
          await tx.arqueo.update({
            where: {
              id: arqueo.id,
            },
            data: {
              totalFicohsa: {
                increment: total,
              },
            },
          });
          break;

        case 'DAVIVIENDA':
          await tx.arqueo.update({
            where: {
              id: arqueo.id,
            },
            data: {
              totalDavivienda: {
                increment: total,
              },
            },
          });
          break;

        case 'TRANSFERENCIA':
          await tx.arqueo.update({
            where: {
              id: arqueo.id,
            },
            data: {
              totalTransferencias: {
                increment: total,
              },
            },
          });
          break;
      }

      // ==========================================
      // ACTUALIZAR ESTADO DEL PEDIDO
      // ==========================================
      await tx.pedidos.update({
        where: {
          id,
        },
        data: {
          estado: 'FACTURADO',
        },
      });

      return venta;
    });
  }
}

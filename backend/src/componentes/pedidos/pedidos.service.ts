import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  // 🆕 CREAR PEDIDO (vendedor)
  // 🆕 CREAR PEDIDO CON DETALLES EN UNA SOLA TRANSACCIÓN
  async crearPedido(data: any) {
    const { detalles, ...pedidoData } = data;

    if (!detalles || detalles.length === 0) {
      throw new BadRequestException('El pedido no contiene productos');
    }

    return this.prisma.$transaction(async (tx) => {
      // Crear encabezado del pedido
      const pedido = await tx.pedidos.create({
        data: {
          ...pedidoData,
          estado: 'EN_PROCESO',
        },
      });

      // Crear detalles
      await tx.pedidoDetalle.createMany({
        data: detalles.map((d: any) => ({
          pedidoId: pedido.id,
          productoCodigo: d.productoCodigo,
          ubicacion: d.ubicacion,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
        })),
      });

      // Retornar pedido completo
      return tx.pedidos.findUnique({
        where: { id: pedido.id },
        include: {
          cliente: true,
          usuario: true,
          detalles: {
            include: {
              producto: true,
              ubicacionRel: true,
            },
          },
        },
      });
    });
  }

  // 📋 OBTENER TODOS LOS PEDIDOS
  async listarPedidos() {
    return this.prisma.pedidos.findMany({
      include: {
        cliente: true,
        usuario: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  // 🔍 OBTENER PEDIDO POR ID
  async obtenerPedido(id: number) {
    return this.prisma.pedidos.findUnique({
      where: { id },
      include: {
        cliente: true,
        usuario: true,
        detalles: {
          include: {
            producto: true,
            ubicacionRel: true,
          },
        },
      },
    });
  }

  // ➕ AGREGAR PRODUCTO A PEDIDO
  async agregarProducto(pedidoId: number, detalle: any) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    if (pedido.estado !== 'EN_PROCESO') {
      throw new BadRequestException('No se puede modificar este pedido');
    }

    const subtotal = detalle.cantidad * detalle.precioUnitario;

    return this.prisma.pedidoDetalle.create({
      data: {
        pedidoId,
        productoCodigo: detalle.productoCodigo,
        ubicacion: detalle.ubicacion,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal,
      },
    });
  }

  // ❌ ELIMINAR PRODUCTO DEL PEDIDO
  async eliminarDetalle(detalleId: number) {
    return this.prisma.pedidoDetalle.delete({
      where: { id: detalleId },
    });
  }

  // 🔄 ENVIAR A CAJA
  async enviarACaja(id: number) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: { id },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    return this.prisma.pedidos.update({
      where: { id },
      data: {
        estado: 'EN_CAJA',
      },
    });
  }

  async listarPedidosEnCaja() {
    return this.prisma.pedidos.findMany({
      where: {
        estado: 'EN_CAJA',
      },
      include: {
        cliente: true,
        usuario: true,
        detalles: {
          include: {
            producto: true,
            ubicacionRel: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  // ❌ CANCELAR PEDIDO
  async cancelarPedido(id: number) {
    return this.prisma.pedidos.update({
      where: { id },
      data: {
        estado: 'CANCELADO',
      },
    });
  }

  // ✅ FACTURAR PEDIDO
  async facturarPedido(id: number, data: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Obtener pedido con detalles
      const pedido = await tx.pedidos.findUnique({
        where: { id },
        include: {
          detalles: {
            include: {
              producto: true,
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

      // 2. Validar stock por ubicación
      for (const detalle of pedido.detalles) {
        const inventario = await tx.inventario.findFirst({
          where: {
            productoCodigo: detalle.productoCodigo,
            ubicacion: detalle.ubicacion,
          },
        });

        if (!inventario) {
          throw new BadRequestException(
            `No existe inventario para ${detalle.productoCodigo} en ${detalle.ubicacion}`,
          );
        }

        if (inventario.cantidad < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${detalle.productoCodigo} en ${detalle.ubicacion}`,
          );
        }
      }

      // 3. Crear número de recibo
      const numeroRecibo = `REC-${Date.now()}`;

      // 4. Crear venta con detalles
      const venta = await tx.ventas.create({
        data: {
          numeroRecibo,
          clienteId: pedido.clienteId || 'CF',
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
          detalles: true,
        },
      });

      // 5. Descontar inventario y registrar movimientos
      for (const detalle of pedido.detalles) {
        // Obtener inventario actual
        const inventario = await tx.inventario.findFirst({
          where: {
            productoCodigo: detalle.productoCodigo,
            ubicacion: detalle.ubicacion,
          },
        });

        // Descontar stock
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

        // Registrar movimiento
        await tx.movimientosInventario.create({
          data: {
            productoCodigo: detalle.productoCodigo,
            tipo: 'SALIDA',
            cantidad: detalle.cantidad,
            fecha: new Date(),
            referencia: `VENTA-${venta.id}`,
            usuarioCodigo: pedido.usuarioCodigo,
          },
        });
      }

      // 6. Actualizar o crear arqueo del día para el usuario
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
        arqueo = await tx.arqueo.create({
          data: {
            usuarioCodigo: pedido.usuarioCodigo,
            totalEfectivo: 0,
            totalBac: 0,
            totalFicohsa: 0,
            totalDavivienda: 0,
            totalTransferencias: 0,
            totalRetiros: 0,
            totalDevoluciones: 0,
          },
        });
      }

      // Incrementar según método de pago
      const total = pedido.total;

      switch (data.metodoPago) {
        case 'EFECTIVO':
          await tx.arqueo.update({
            where: { id: arqueo.id },
            data: {
              totalEfectivo: {
                increment: total,
              },
            },
          });
          break;

        case 'BAC':
          await tx.arqueo.update({
            where: { id: arqueo.id },
            data: {
              totalBac: {
                increment: total,
              },
            },
          });
          break;

        case 'FICOHSA':
          await tx.arqueo.update({
            where: { id: arqueo.id },
            data: {
              totalFicohsa: {
                increment: total,
              },
            },
          });
          break;

        case 'DAVIVIENDA':
          await tx.arqueo.update({
            where: { id: arqueo.id },
            data: {
              totalDavivienda: {
                increment: total,
              },
            },
          });
          break;

        case 'TRANSFERENCIA':
          await tx.arqueo.update({
            where: { id: arqueo.id },
            data: {
              totalTransferencias: {
                increment: total,
              },
            },
          });
          break;
      }

      // 7. Marcar pedido como facturado
      await tx.pedidos.update({
        where: { id },
        data: {
          estado: 'FACTURADO',
        },
      });

      // 8. Retornar venta completa
      return venta;
    });
  }
}

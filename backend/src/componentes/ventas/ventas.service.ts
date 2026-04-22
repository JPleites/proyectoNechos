import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Ventas, Prisma } from '@prisma/client';

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(
    ventasWhereUniqueInput: Prisma.VentasWhereUniqueInput,
  ): Promise<Ventas | null> {
    return this.prisma.ventas.findUnique({
      where: ventasWhereUniqueInput,
      include: {
        detalles: true,
        cliente: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.VentasWhereUniqueInput;
    where?: Prisma.VentasWhereInput;
    orderBy?: Prisma.VentasOrderByWithRelationInput;
  }): Promise<Ventas[]> {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prisma.ventas.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        detalles: true,
        cliente: true,
      },
    });
  }
  async create(data: Prisma.VentasCreateInput): Promise<Ventas> {
    return this.prisma.ventas.create({
      data,
      include: {
        detalles: true,
      },
    });
  }

  async update(params: {
    where: Prisma.VentasWhereUniqueInput;
    data: Prisma.VentasUpdateInput;
  }): Promise<Ventas> {
    const { where, data } = params;

    return this.prisma.ventas.update({
      where,
      data,
    });
  }

  async delete(where: Prisma.VentasWhereUniqueInput): Promise<Ventas> {
    return this.prisma.ventas.delete({
      where,
    });
  }

  async finalizarVenta(ventaId: number, usuarioCodigo: number) {
    await this.prisma.$transaction(async (prisma) => {
      // 1. Obtener venta con detalles
      const venta = await this.prisma.ventas.findUnique({
        where: { id: ventaId },
        include: { detalles: true },
      });

      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      if (venta.estado === 'FINALIZADO') {
        throw new Error('La venta ya fue finalizada');
      }

      // 2. VALIDAR STOCK ANTES DE TODO
      for (const item of venta.detalles) {
        const inventario = await this.prisma.inventario.findFirst({
          where: {
            productoCodigo: item.productoCodigo,
          },
        });

        if (!inventario) {
          throw new Error(
            `No hay inventario para el producto ${item.productoCodigo}`,
          );
        }

        if (inventario.cantidad < item.cantidad) {
          throw new Error(
            `Stock insuficiente para ${item.productoCodigo}. Disponible: ${inventario.cantidad}`,
          );
        }
      }

      // 3. CAMBIAR ESTADO DE VENTA
      await this.prisma.ventas.update({
        where: { id: ventaId },
        data: { estado: 'FINALIZADO' },
      });

      // 4. DESCONTAR INVENTARIO + CREAR MOVIMIENTOS
      for (const item of venta.detalles) {
        // 🔥 DESCONTAR STOCK
        await this.prisma.inventario.updateMany({
          where: {
            productoCodigo: item.productoCodigo,
          },
          data: {
            cantidad: {
              decrement: item.cantidad,
            },
          },
        });

        // 🔥 CREAR MOVIMIENTO
        await this.prisma.movimientosInventario.create({
          data: {
            productoCodigo: item.productoCodigo,
            tipo: 'SALIDA',
            cantidad: item.cantidad,
            referencia: `VENTA_${ventaId}`,
            usuarioCodigo,
          },
        });
      }

      return {
        message: 'Venta finalizada y stock actualizado correctamente',
      };
    });
  }
}

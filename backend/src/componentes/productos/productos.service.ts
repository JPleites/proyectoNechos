import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Productos, Prisma } from '@prisma/client';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async producto(
    productoWhereUniqueInput: Prisma.ProductosWhereUniqueInput,
  ): Promise<Productos | null> {
    return this.prisma.productos.findUnique({
      where: productoWhereUniqueInput,
    });
  }

  async productos(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductosWhereUniqueInput;
    where?: Prisma.ProductosWhereInput;
    orderBy?: Prisma.ProductosOrderByWithRelationInput;
  }): Promise<Productos[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.productos.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createProductos(data: Prisma.ProductosCreateInput): Promise<Productos> {
    return this.prisma.productos.create({
      data,
    });
  }

  async updateProductos(params: {
    where: Prisma.ProductosWhereUniqueInput;
    data: Prisma.ProductosUpdateInput;
  }): Promise<Productos> {
    const { where, data } = params;
    return this.prisma.productos.update({
      data,
      where,
    });
  }

  async deleteProductos(
    where: Prisma.ProductosWhereUniqueInput,
  ): Promise<Productos> {
    return this.prisma.productos.delete({
      where,
    });
  }

  async buscarProductos(q: string) {
    return this.prisma.productos.findMany({
      where: {
        OR: [
          { codigo: { contains: q } },
          { producto: { contains: q, mode: 'insensitive' } },
          { marca: { contains: q, mode: 'insensitive' } },
          { categoria: { contains: q, mode: 'insensitive' } },
        ],
      },
    });
  }

  async productoConInventario(codigo: string) {
    return this.prisma.productos.findUnique({
      where: { codigo },
      include: {
        inventario: true,
      },
    });
  }
}

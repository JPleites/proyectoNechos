import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Inventario, Prisma } from '@prisma/client';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async inventario(
    inventarioWhereUniqueInput: Prisma.InventarioWhereUniqueInput,
  ): Promise<Inventario | null> {
    return this.prisma.inventario.findUnique({
      where: inventarioWhereUniqueInput,
    });
  }

  async inventarios(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.InventarioWhereUniqueInput;
    where?: Prisma.InventarioWhereInput;
    orderBy?: Prisma.InventarioOrderByWithRelationInput;
  }): Promise<Inventario[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.inventario.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createInventario(
    data: Prisma.InventarioCreateInput,
  ): Promise<Inventario> {
    return this.prisma.inventario.create({
      data,
    });
  }

  async updateInventario(params: {
    where: Prisma.InventarioWhereUniqueInput;
    data: Prisma.InventarioUpdateInput;
  }): Promise<Inventario> {
    const { where, data } = params;
    return this.prisma.inventario.update({
      data,
      where,
    });
  }

  async deleteInventario(
    where: Prisma.InventarioWhereUniqueInput,
  ): Promise<Inventario> {
    return this.prisma.inventario.delete({
      where,
    });
  }
}

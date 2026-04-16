import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Almacenes, Prisma } from '@prisma/client';

@Injectable()
export class AlmacenesService {
  constructor(private prisma: PrismaService) {}

  async almacen(
    almacenWhereUniqueInput: Prisma.AlmacenesWhereUniqueInput,
  ): Promise<Almacenes | null> {
    return this.prisma.almacenes.findUnique({
      where: almacenWhereUniqueInput,
    });
  }

  async almacenes(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AlmacenesWhereUniqueInput;
    where?: Prisma.AlmacenesWhereInput;
    orderBy?: Prisma.AlmacenesOrderByWithRelationInput;
  }): Promise<Almacenes[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.almacenes.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createAlmacenes(data: Prisma.AlmacenesCreateInput): Promise<Almacenes> {
    return this.prisma.almacenes.create({
      data,
    });
  }

  async updateAlmacenes(params: {
    where: Prisma.AlmacenesWhereUniqueInput;
    data: Prisma.AlmacenesUpdateInput;
  }): Promise<Almacenes> {
    const { where, data } = params;
    return this.prisma.almacenes.update({
      data,
      where,
    });
  }

  async deleteAlmacenes(
    where: Prisma.AlmacenesWhereUniqueInput,
  ): Promise<Almacenes> {
    return this.prisma.almacenes.delete({
      where,
    });
  }
}

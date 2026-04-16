import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Proveedores, Prisma } from '@prisma/client';

@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}

  async proveedor(
    proveedorWhereUniqueInput: Prisma.ProveedoresWhereUniqueInput,
  ): Promise<Proveedores | null> {
    return this.prisma.proveedores.findUnique({
      where: proveedorWhereUniqueInput,
    });
  }

  async proveedores(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProveedoresWhereUniqueInput;
    where?: Prisma.ProveedoresWhereInput;
    orderBy?: Prisma.ProveedoresOrderByWithRelationInput;
  }): Promise<Proveedores[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.proveedores.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createProveedores(
    data: Prisma.ProveedoresCreateInput,
  ): Promise<Proveedores> {
    return this.prisma.proveedores.create({
      data,
    });
  }

  async updateProveedores(params: {
    where: Prisma.ProveedoresWhereUniqueInput;
    data: Prisma.ProveedoresUpdateInput;
  }): Promise<Proveedores> {
    const { where, data } = params;
    return this.prisma.proveedores.update({
      data,
      where,
    });
  }

  async deleteProveedores(
    where: Prisma.ProveedoresWhereUniqueInput,
  ): Promise<Proveedores> {
    return this.prisma.proveedores.delete({
      where,
    });
  }
}

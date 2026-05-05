import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Proveedores, Prisma } from '@prisma/client';

@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService) {}

  async proveedor(
    where: Prisma.ProveedoresWhereUniqueInput,
  ): Promise<Proveedores | null> {
    return this.prisma.proveedores.findUnique({
      where,
    });
  }

  async proveedores(): Promise<Proveedores[]> {
    return this.prisma.proveedores.findMany({
      include: {
        CategoriaProveedores: {
          include: {
            categoria: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.ProveedoresCreateInput): Promise<Proveedores> {
    const existe = await this.prisma.proveedores.findUnique({
      where: { rtn: data.rtn },
    });

    if (existe) {
      throw new Error('Proveedor ya existe');
    }

    return this.prisma.proveedores.create({
      data,
    });
  }

  async update(params: {
    where: Prisma.ProveedoresWhereUniqueInput;
    data: Prisma.ProveedoresUpdateInput;
  }): Promise<Proveedores> {
    return this.prisma.proveedores.update(params);
  }

  async delete(where: Prisma.ProveedoresWhereUniqueInput) {
    return this.prisma.proveedores.delete({ where });
  }
}
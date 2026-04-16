import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Categoria, Prisma } from '@prisma/client';

@Injectable()
export class CategoriaService {
  constructor(private prisma: PrismaService) {}

  async categoria(
    categoriaWhereUniqueInput: Prisma.CategoriaWhereUniqueInput,
  ): Promise<Categoria | null> {
    return this.prisma.categoria.findUnique({
      where: categoriaWhereUniqueInput,
    });
  }

  async categorias(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CategoriaWhereUniqueInput;
    where?: Prisma.CategoriaWhereInput;
    orderBy?: Prisma.CategoriaOrderByWithRelationInput;
  }): Promise<Categoria[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.categoria.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createCategoria(data: Prisma.CategoriaCreateInput): Promise<Categoria> {
    return this.prisma.categoria.create({
      data,
    });
  }

  async updateCategoria(params: {
    where: Prisma.CategoriaWhereUniqueInput;
    data: Prisma.CategoriaUpdateInput;
  }): Promise<Categoria> {
    const { where, data } = params;
    return this.prisma.categoria.update({
      data,
      where,
    });
  }

  async deleteCategoria(
    where: Prisma.CategoriaWhereUniqueInput,
  ): Promise<Categoria> {
    return this.prisma.categoria.delete({
      where,
    });
  }
}

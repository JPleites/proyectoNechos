import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Arqueo, Prisma } from '@prisma/client';

@Injectable()
export class ArqueoService {
  constructor(private prisma: PrismaService) {}

  async arqueo(
    arqueoWhereUniqueInput: Prisma.ArqueoWhereUniqueInput,
  ): Promise<Arqueo | null> {
    return this.prisma.arqueo.findUnique({
      where: arqueoWhereUniqueInput,
    });
  }

  async arqueos(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ArqueoWhereUniqueInput;
    where?: Prisma.ArqueoWhereInput;
    orderBy?: Prisma.ArqueoOrderByWithRelationInput;
  }): Promise<Arqueo[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.arqueo.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createArqueo(data: Prisma.ArqueoCreateInput): Promise<Arqueo> {
    return this.prisma.arqueo.create({
      data,
    });
  }

  async updateArqueo(params: {
    where: Prisma.ArqueoWhereUniqueInput;
    data: Prisma.ArqueoUpdateInput;
  }): Promise<Arqueo> {
    const { where, data } = params;
    return this.prisma.arqueo.update({
      data,
      where,
    });
  }

  async deleteArqueo(
    where: Prisma.ArqueoWhereUniqueInput,
  ): Promise<Arqueo> {
    return this.prisma.arqueo.delete({
      where,
    });
  }
}

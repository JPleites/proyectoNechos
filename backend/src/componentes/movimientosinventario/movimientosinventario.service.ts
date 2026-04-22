import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MovimientosinventarioService {
  constructor(private readonly prisma: PrismaService) {}

  // 📋 listar movimientos
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.MovimientosInventarioWhereInput;
  }) {
    const { skip, take, where } = params;

    return this.prisma.movimientosInventario.findMany({
      skip,
      take,
      where,
      include: {
        producto: true,
        usuario: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.movimientosInventario.findUnique({
      where: { id },
      include: {
        producto: true,
        usuario: true,
      },
    });
  }

  async create(data: Prisma.MovimientosInventarioCreateInput) {
    return this.prisma.movimientosInventario.create({
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.movimientosInventario.delete({
      where: { id },
    });
  }
}
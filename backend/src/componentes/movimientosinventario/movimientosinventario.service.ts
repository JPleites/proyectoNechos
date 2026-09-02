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
        usuario: {
          include: {
            perfil: true,
          },
        },

        ubicacionOrigenRel: true,
        ubicacionDestinoRel: true,
      },

      orderBy: {
        fecha: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.movimientosInventario.findUnique({
      where: {
        id,
      },

      include: {
        producto: true,

        usuario: {
          include: {
            perfil: true,
          },
        },

        ubicacionOrigenRel: true,
        ubicacionDestinoRel: true,
      },
    });
  }
}

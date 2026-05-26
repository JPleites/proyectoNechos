import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Almacenes, Prisma } from '@prisma/client';

@Injectable()
export class AlmacenesService {
  constructor(private prisma: PrismaService) {}

  // 🔍 Obtener uno
  async almacen(
    almacenWhereUniqueInput: Prisma.AlmacenesWhereUniqueInput,
  ): Promise<Almacenes | null> {
    return this.prisma.almacenes.findUnique({
      where: almacenWhereUniqueInput,
    });
  }

  // 📋 Listar
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

  // 🆕 CREAR ALMACÉN CON CODIGO A1, A2, A3...
  async createAlmacenes(data: Prisma.AlmacenesCreateInput): Promise<Almacenes> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear primero el registro (para obtener ID autoincrementable)
      const temp = await tx.almacenes.create({
        data: {
          almacen: data.almacen,
          almacenID: '', // temporal
        },
      });

      // 2. Generar código tipo A1, A2, A3
      const almacenID = `A${temp.id}`;

      // 3. Actualizar con el código generado
      const updated = await tx.almacenes.update({
        where: { id: temp.id },
        data: {
          almacenID,
        },
      });

      return updated;
    });
  }

  // ✏️ Actualizar
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

  // 🗑️ Eliminar
  async deleteAlmacenes(
    where: Prisma.AlmacenesWhereUniqueInput,
  ): Promise<Almacenes> {
    return this.prisma.almacenes.delete({
      where,
    });
  }
}
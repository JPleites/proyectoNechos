import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UbicacionesService {
  constructor(private readonly prisma: PrismaService) {}

  // 🔍 Obtener una ubicación
  async findOne(id: string) {
    return this.prisma.ubicaciones.findUnique({
      where: { ubicacion: id },
      include: {
        almacen: true,
        inventario: true,
      },
    });
  }

  // 📋 Listar ubicaciones ordenadas por nombre
  async findAll() {
    return this.prisma.ubicaciones.findMany({
      include: {
        almacen: true,
        inventario: true,
      },
      orderBy: [
        { almacenId: 'asc' },
        { estante: 'asc' },
        { nivel: 'asc' },
        { deposito: 'asc' },
      ],
    });
  }

  // ➕ Crear ubicación
  async create(data: any) {
    const almacenId = Number(data.almacenId);

    const almacen = await this.prisma.almacenes.findUnique({
      where: { id: almacenId },
    });

    if (!almacen) {
      throw new BadRequestException('El almacén no existe');
    }

    const ubicacion = [
      almacen.almacenID,
      `E${Number(data.estante)}`,
      `N${Number(data.nivel)}`,
      `D${Number(data.deposito)}`,
    ].join('');

    const existe = await this.prisma.ubicaciones.findUnique({
      where: { ubicacion },
    });

    if (existe) {
      throw new BadRequestException('La ubicación ya existe');
    }

    return this.prisma.ubicaciones.create({
      data: {
        ubicacion,
        estante: Number(data.estante),
        nivel: Number(data.nivel),
        deposito: Number(data.deposito),
        almacenId,
      },
    });
  }

  // ✏️ Actualizar ubicación
  async update(id: string, data: any) {
    const ubicacionExistente = await this.prisma.ubicaciones.findUnique({
      where: { ubicacion: id },
    });

    if (!ubicacionExistente) {
      throw new NotFoundException('La ubicación no existe');
    }

    if (data.almacenId) {
      const almacen = await this.prisma.almacenes.findUnique({
        where: {
          id: Number(data.almacenId),
        },
      });

      if (!almacen) {
        throw new BadRequestException('El almacén no existe');
      }
    }

    return this.prisma.ubicaciones.update({
      where: { ubicacion: id },
      data: {
        ...(data.estante !== undefined && {
          estante: Number(data.estante),
        }),
        ...(data.nivel !== undefined && {
          nivel: Number(data.nivel),
        }),
        ...(data.deposito !== undefined && {
          deposito: Number(data.deposito),
        }),
        ...(data.almacenId !== undefined && {
          almacenId: Number(data.almacenId),
        }),
      },
    });
  }

  // 🗑️ Eliminar ubicación
  async delete(id: string) {
    const ubicacion = await this.prisma.ubicaciones.findUnique({
      where: { ubicacion: id },
    });

    if (!ubicacion) {
      throw new NotFoundException('La ubicación no existe');
    }

    return this.prisma.ubicaciones.delete({
      where: { ubicacion: id },
    });
  }
}

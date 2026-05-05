import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UbicacionesService {
  constructor(private prisma: PrismaService) {}

  // 🔍 Obtener una ubicación
  async findOne(id: string) {
    return this.prisma.ubicaciones.findUnique({
      where: { ubicacion: id },
      include: {
        almacen: true,
      },
    });
  }

  // 📋 Listar ubicaciones
  async findAll() {
    return this.prisma.ubicaciones.findMany({
      include: {
        almacen: true,
      },
    });
  }

  // ➕ Crear ubicación (CON VALIDACIONES 🔥)
  async create(data: any) {
    // 1. Validar almacén
    const almacen = await this.prisma.almacenes.findUnique({
      where: { id: data.almacenId },
    });

    if (!almacen) {
      throw new Error('El almacén no existe');
    }

    // 2. Validar duplicado
    const existe = await this.prisma.ubicaciones.findUnique({
      where: { ubicacion: data.ubicacion },
    });

    if (existe) {
      throw new Error('La ubicación ya existe');
    }

    // 3. Crear con relación correcta
    return this.prisma.ubicaciones.create({
      data: {
        ubicacion: data.ubicacion,
        estante: data.estante,
        nivel: data.nivel,
        almacen: {
          connect: { id: data.almacenId },
        },
      },
    });
  }

  // ✏️ Actualizar
  async update(id: string, data: any) {
    // Validar almacén si viene
    if (data.almacenId) {
      const almacen = await this.prisma.almacenes.findUnique({
        where: { id: data.almacenId },
      });

      if (!almacen) {
        throw new Error('El almacén no existe');
      }
    }

    return this.prisma.ubicaciones.update({
      where: { ubicacion: id },
      data: {
        estante: data.estante,
        nivel: data.nivel,
        ...(data.almacenId && {
          almacen: {
            connect: { id: data.almacenId },
          },
        }),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.ubicaciones.delete({
      where: { ubicacion: id },
    });
  }
}
import { Injectable, BadRequestException } from '@nestjs/common';
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
        inventario: true,
      },
    });
  }

  // 📋 Listar ubicaciones
  async findAll() {
    return this.prisma.ubicaciones.findMany({
      include: {
        almacen: true,
        inventario: true,
      },
    });
  }

  // ➕ Crear ubicación
  async create(data: any) {
    const { almacenId, estante, nivel, deposito } = data;

    // 1. Validar almacén
    const almacen = await this.prisma.almacenes.findUnique({
      where: { id: Number(almacenId) },
    });

    if (!almacen) {
      throw new BadRequestException('El almacén no existe');
    }

    // 2. Generar código de ubicación
    const ubicacion = [
      almacen.almacenID,
      `N${nivel}`,
      `E${estante}`,
      `D${deposito}`,
    ].join('');

    // 3. Validar duplicado
    const existe = await this.prisma.ubicaciones.findUnique({
      where: { ubicacion },
    });

    if (existe) {
      throw new BadRequestException('La ubicación ya existe');
    }

    // 4. Crear ubicación
    return this.prisma.ubicaciones.create({
      data: {
        ubicacion,
        estante: Number(estante),
        nivel: Number(nivel),
        deposito: Number(deposito),
        almacenId: Number(almacenId),
      },
    });
  }

  // ✏️ Actualizar ubicación
  async update(id: string, data: any) {
    const { estante, nivel, deposito, almacenId } = data;

    // validar almacén si viene
    if (almacenId) {
      const almacen = await this.prisma.almacenes.findUnique({
        where: { id: Number(almacenId) },
      });

      if (!almacen) {
        throw new BadRequestException('El almacén no existe');
      }
    }

    return this.prisma.ubicaciones.update({
      where: { ubicacion: id },
      data: {
        ...(estante !== undefined && { estante: Number(estante) }),
        ...(nivel !== undefined && { nivel: Number(nivel) }),
        ...(deposito !== undefined && { deposito: Number(deposito) }),
        ...(almacenId !== undefined && {
          almacenId: Number(almacenId),
        }),
      },
    });
  }

  // 🗑️ Eliminar
  async delete(id: string) {
    return this.prisma.ubicaciones.delete({
      where: { ubicacion: id },
    });
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriaProveedoresService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // OBTENER POR PROVEEDOR
  // =========================
  async getByProveedor(proveedorId: number) {
    return this.prisma.categoriaProveedores.findMany({
      where: { proveedorId },
      include: {
        categoria: true,
        proveedor: true,
      },
    });
  }

  // =========================
  // ASIGNAR CATEGORÍAS
  // =========================
  async asignarCategorias(
    proveedorId: number,
    categorias: number[],
  ) {
    if (!categorias.length) {
      throw new BadRequestException(
        'Debe enviar al menos una categoría',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. eliminar relaciones actuales
      await tx.categoriaProveedores.deleteMany({
        where: { proveedorId },
      });

      // 2. crear nuevas relaciones
      const data = categorias.map((categoriaId) => ({
        proveedorId,
        categoriaId,
      }));

      return tx.categoriaProveedores.createMany({
        data,
      });
    });
  }

  // =========================
  // AGREGAR UNA SOLA RELACIÓN
  // =========================
  async asignarUno(proveedorId: number, categoriaId: number) {
    const existe = await this.prisma.categoriaProveedores.findUnique({
      where: {
        categoriaId_proveedorId: {
          categoriaId,
          proveedorId,
        },
      },
    });

    if (existe) {
      throw new BadRequestException(
        'Esta relación ya existe',
      );
    }

    return this.prisma.categoriaProveedores.create({
      data: {
        categoriaId,
        proveedorId,
      },
    });
  }

  // =========================
  // ELIMINAR UNA RELACIÓN
  // =========================
  async eliminarUno(proveedorId: number, categoriaId: number) {
    return this.prisma.categoriaProveedores.delete({
      where: {
        categoriaId_proveedorId: {
          categoriaId,
          proveedorId,
        },
      },
    });
  }
}
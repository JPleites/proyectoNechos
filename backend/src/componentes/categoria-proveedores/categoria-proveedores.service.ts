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
      where: {
        proveedorId: Number(proveedorId),
      },
      include: {
        categoria: true,
        proveedor: true,
      },
    });
  }

  // =========================
  // ASIGNAR CATEGORÍAS
  // =========================
  async asignarCategorias(proveedorId: number, categorias: number[]) {
    return this.prisma.$transaction(async (tx) => {
      // Categorías actuales del proveedor
      const actuales = await tx.categoriaProveedores.findMany({
        where: { proveedorId },
        select: {
          categoriaId: true,
        },
      });

      const categoriasActuales = actuales.map((c) => c.categoriaId);

      // Categorías nuevas que hay que agregar
      const agregar = categorias.filter(
        (id) => !categoriasActuales.includes(id),
      );

      // Categorías que el usuario quitó
      const eliminar = categoriasActuales.filter(
        (id) => !categorias.includes(id),
      );

      // Crear nuevas relaciones
      if (agregar.length > 0) {
        await tx.categoriaProveedores.createMany({
          data: agregar.map((categoriaId) => ({
            proveedorId,
            categoriaId,
          })),
        });
      }

      // Eliminar únicamente las removidas
      if (eliminar.length > 0) {
        await tx.categoriaProveedores.deleteMany({
          where: {
            proveedorId,
            categoriaId: {
              in: eliminar,
            },
          },
        });
      }

      return {
        mensaje: 'Categorías actualizadas correctamente',
      };
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
      throw new BadRequestException('Esta relación ya existe');
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

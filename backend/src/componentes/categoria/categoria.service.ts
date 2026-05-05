import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categoria.findMany({
      include: {
        CategoriaProveedores: {
          include: {
            proveedor: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.categoria.findUnique({
      where: { id },
      include: {
        CategoriaProveedores: {
          include: {
            proveedor: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    // 🚫 validar duplicado
    const existe = await this.prisma.categoria.findUnique({
      where: { id: data.id },
    });

    if (existe) {
      throw new Error('La categoría ya existe');
    }

    return this.prisma.categoria.create({
      data: {
        id: data.id,
        nombre: data.nombre,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.categoria.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.categoria.delete({
      where: { id },
    });
  }

  async asignarProveedor(categoriaId: string, proveedorRtn: string) {
    return this.prisma.categoriaProveedores.create({
      data: {
        categoriaId,
        proveedorRtn,
      },
    });
  }

  async quitarProveedor(categoriaId: string, proveedorRtn: string) {
    return this.prisma.categoriaProveedores.delete({
      where: {
        categoriaId_proveedorRtn: {
          categoriaId,
          proveedorRtn,
        },
      },
    });
  }
}

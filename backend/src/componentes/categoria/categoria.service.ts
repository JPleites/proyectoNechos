import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { GeneradorCodigoService } from '../../common/services/generador-codigo/generador-codigo.service';

@Injectable()
export class CategoriaService {
  constructor(
    private prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  // =========================
  // GENERAR CATEGORIA ID
  // =========================
  async generarCategoriaID() {
    const ultimaCategoria = await this.prisma.categoria.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    const siguienteNumero = ultimaCategoria ? ultimaCategoria.id + 1 : 1;

    return this.codeGen.generate('CAT', siguienteNumero);
  }

  // =========================
  // GENERAR SUBCATEGORIA ID
  // =========================
  async generarSubCategoriaID() {
    const ultima = await this.prisma.subCategoria.findFirst({
      orderBy: { id: 'desc' },
    });
    const siguiente = ultima ? ultima.id + 1 : 1;
    return this.codeGen.generate('SCAT', siguiente);
  }

  // =========================
  // LISTAR TODAS
  // =========================
  async findAll() {
    return this.prisma.categoria.findMany({
      include: {
        CategoriaProveedores: {
          include: {
            proveedor: true,
          },
        },
        subCategorias: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // =========================
  // OBTENER UNA
  // =========================
  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        CategoriaProveedores: {
          include: {
            proveedor: true,
          },
        },
        subCategorias: true,
      },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return categoria;
  }

  // =========================
  // LISTAR SUBCATEGORIAS POR CATEGORIA
  // =========================
  async findSubCategorias(categoriaId: number) {
    return this.prisma.subCategoria.findMany({
      where: { categoriaId },
      orderBy: { nombre: 'asc' },
    });
  }

  // =========================
  // CREAR
  // =========================
  async create(data: any) {
    // Validar duplicado por nombre
    const existe = await this.prisma.categoria.findFirst({
      where: {
        nombre: {
          equals: data.nombre,
          mode: 'insensitive',
        },
      },
    });

    if (existe) {
      throw new BadRequestException('La categoría ya existe');
    }

    // Generar código interno
    const categoriaID = await this.generarCategoriaID();

    return this.prisma.categoria.create({
      data: {
        categoriaID,
        nombre: data.nombre,
      },
    });
  }

  async createSubCategoria(data: any) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: Number(data.categoriaId) },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const existe = await this.prisma.subCategoria.findFirst({
      where: {
        nombre: { equals: data.nombre, mode: 'insensitive' },
        categoriaId: Number(data.categoriaId),
      },
    });

    if (existe) {
      throw new BadRequestException(
        'La subcategoría ya existe en esta categoría',
      );
    }

    const subCategoriaID = await this.generarSubCategoriaID();

    return this.prisma.subCategoria.create({
      data: {
        subCategoriaID,
        nombre: data.nombre,
        categoria: { connect: { id: Number(data.categoriaId) } },
      },
    });
  }

  // =========================
  // ACTUALIZAR
  // =========================
  async update(id: number, data: any) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Validar duplicado de nombre
    if (data.nombre) {
      const existe = await this.prisma.categoria.findFirst({
        where: {
          nombre: {
            equals: data.nombre,
            mode: 'insensitive',
          },
          NOT: {
            id,
          },
        },
      });

      if (existe) {
        throw new BadRequestException('Ya existe una categoría con ese nombre');
      }
    }

    return this.prisma.categoria.update({
      where: { id },
      data,
    });
  }

  // =========================
  // ELIMINAR
  // =========================
  async delete(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return this.prisma.categoria.delete({
      where: { id },
    });
  }

  // =========================
  // ELIMINAR SUBCATEGORIA
  // =========================
  async deleteSubCategoria(id: number) {
    const sub = await this.prisma.subCategoria.findUnique({ where: { id } });

    if (!sub) {
      throw new NotFoundException('Subcategoría no encontrada');
    }

    return this.prisma.subCategoria.delete({ where: { id } });
  }

  // =========================
  // ASIGNAR PROVEEDOR
  // =========================
  async asignarProveedor(categoriaId: number, proveedorId: number) {
    // Validar categoría
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Validar proveedor
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id: proveedorId },
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    // Evitar duplicados
    const existe = await this.prisma.categoriaProveedores.findUnique({
      where: {
        categoriaId_proveedorId: {
          categoriaId,
          proveedorId,
        },
      },
    });

    if (existe) {
      throw new BadRequestException('El proveedor ya está asignado');
    }

    return this.prisma.categoriaProveedores.create({
      data: {
        categoriaId,
        proveedorId,
      },
    });
  }

  // =========================
  // QUITAR PROVEEDOR
  // =========================
  async quitarProveedor(categoriaId: number, proveedorId: number) {
    return this.prisma.categoriaProveedores.delete({
      where: {
        categoriaId_proveedorId: {
          categoriaId,
          proveedorId,
        },
      },
    });
  }

  // =========================
  // BUSCAR
  // =========================
  async buscar(query: string) {
    return this.prisma.categoria.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            categoriaID: {
              contains: query,
            },
          },
        ],
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }
}

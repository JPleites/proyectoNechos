import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Productos, Prisma } from '@prisma/client';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  // 🔍 Obtener un producto
  async producto(
    productoWhereUniqueInput: Prisma.ProductosWhereUniqueInput,
  ): Promise<Productos | null> {
    return this.prisma.productos.findUnique({
      where: productoWhereUniqueInput,
    });
  }

  // 📋 Listar productos
  async productos(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductosWhereUniqueInput;
    where?: Prisma.ProductosWhereInput;
    orderBy?: Prisma.ProductosOrderByWithRelationInput;
  }): Promise<Productos[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.productos.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  // 🆕 Crear producto con validaciones 🔥
  async createProductos(data: Prisma.ProductosCreateInput): Promise<Productos> {
    // 0️⃣ evitar duplicados
    const existeProducto = await this.prisma.productos.findUnique({
      where: { codigo: data.codigo },
    });

    if (existeProducto) {
      throw new BadRequestException('El producto ya existe');
    }

    // 1️⃣ validar categoría
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: data.categoria as string },
    });

    if (!categoria) {
      throw new BadRequestException('La categoría no existe');
    }

    // 2️⃣ validar proveedor
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { rtn: data.proveedorRel as string },
    });

    if (!proveedor) {
      throw new BadRequestException('El proveedor no existe');
    }

    // 3️⃣ validar relación categoría-proveedor 🔥
    const relacion = await this.prisma.categoriaProveedores.findUnique({
      where: {
        categoriaId_proveedorRtn: {
          categoriaId: data.categoria as string,
          proveedorRtn: data.proveedorRel as string,
        },
      },
    });

    if (!relacion) {
      throw new BadRequestException(
        'El proveedor no pertenece a la categoría seleccionada',
      );
    }

    // 4️⃣ crear producto
    return this.prisma.productos.create({
      data,
    });
  }

  // ✏️ Actualizar producto con validación inteligente 🔥
  async updateProductos(params: {
    where: Prisma.ProductosWhereUniqueInput;
    data: Prisma.ProductosUpdateInput;
  }): Promise<Productos> {
    const { where, data } = params;

    // Obtener producto actual
    const productoActual = await this.prisma.productos.findUnique({
      where,
    });

    if (!productoActual) {
      throw new BadRequestException('Producto no encontrado');
    }

    // Obtener valores finales (nuevo o actual)
    const categoria = (data.categoria as string) || productoActual.categoria;

    const proveedor = (data.proveedorRel as string) || productoActual.proveedor;

    // Validar relación si existen ambos
    if (categoria && proveedor) {
      const relacion = await this.prisma.categoriaProveedores.findUnique({
        where: {
          categoriaId_proveedorRtn: {
            categoriaId: categoria,
            proveedorRtn: proveedor,
          },
        },
      });

      if (!relacion) {
        throw new BadRequestException(
          'El proveedor no pertenece a la categoría',
        );
      }
    }

    return this.prisma.productos.update({
      where,
      data,
    });
  }

  // 🗑️ Eliminar producto
  async deleteProductos(
    where: Prisma.ProductosWhereUniqueInput,
  ): Promise<Productos> {
    return this.prisma.productos.delete({
      where,
    });
  }

  // 🔎 Buscar productos
  async buscarProductos(q: string) {
    return this.prisma.productos.findMany({
      where: {
        OR: [
          { codigo: { contains: q } },
          { producto: { contains: q, mode: 'insensitive' } },
          { marca: { contains: q, mode: 'insensitive' } },
          { categoria: { contains: q, mode: 'insensitive' } },
        ],
      },
    });
  }

  // 📦 Producto con inventario
  async productoConInventario(codigo: string) {
    return this.prisma.productos.findUnique({
      where: { codigo },
      include: {
        inventario: true,
      },
    });
  }

  async obtenerUbicaciones(productoCodigo: string, almacenId: string) {
    return this.prisma.inventario.findMany({
      where: {
        productoCodigo: String(productoCodigo),
        ubicacionRel: {
          almacenId: String(almacenId),
        },
      },
      include: {
        ubicacionRel: true,
      },
    });
  }
}

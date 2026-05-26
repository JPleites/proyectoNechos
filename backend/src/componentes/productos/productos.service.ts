import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Productos, Prisma } from '@prisma/client';
import { GeneradorCodigoService } from 'src/common/services/generador-codigo/generador-codigo.service';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  // 🔍 Obtener un producto
  async producto(
    where: Prisma.ProductosWhereUniqueInput,
  ): Promise<Productos | null> {
    return this.prisma.productos.findUnique({
      where,
      include: {
        inventario: true,
        proveedorRel: true,
      },
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

  async generarProductoID() {
    const last = await this.prisma.productos.findFirst({
      orderBy: { id: 'desc' },
    });

    const nextNumber = last ? last.id + 1 : 1;

    return this.codeGen.generate('P', nextNumber);
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
      where: { id: Number(data.categoria) },
    });

    if (!categoria) {
      throw new BadRequestException('La categoría no existe');
    }

    // 2️⃣ validar proveedor
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id: Number(data.proveedorRel) },
    });

    if (!proveedor) {
      throw new BadRequestException('El proveedor no existe');
    }

    // 3️⃣ validar relación categoría-proveedor 🔥
    const relacion = await this.prisma.categoriaProveedores.findUnique({
      where: {
        categoriaId_proveedorRtn: {
          categoriaId: categoria.id,
          proveedorRtn: Number(data.proveedorRel),
        },
      },
    });

    if (!relacion) {
      throw new BadRequestException(
        'El proveedor no pertenece a la categoría seleccionada',
      );
    }

    const productoID = await this.generarProductoID();

    data.productoID = productoID;

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

    const producto = await this.prisma.productos.findUnique({
      where,
    });

    if (!producto) {
      throw new BadRequestException('Producto no encontrado');
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
    return this.prisma.productos.delete({ where });
  }

  // 🔎 Buscar productos
  async buscarProductos(q: string) {
    return this.prisma.productos.findMany({
      where: {
        OR: [
          { codigo: { contains: q, mode: 'insensitive' } },
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
        inventario: {
          include: {
            ubicacionRel: true,
          },
        },
      },
    });
  }

  async obtenerUbicaciones(productoCodigo: string, almacenId: number) {
    return this.prisma.inventario.findMany({
      where: {
        productoCodigo: String(productoCodigo),
        ubicacionRel: {
          almacenId: Number(almacenId),
        },
      },
      include: {
        ubicacionRel: true,
      },
    });
  }
}

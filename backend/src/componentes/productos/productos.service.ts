import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Productos, Prisma } from '@prisma/client';
import { GeneradorCodigoService } from '../../common/services/generador-codigo/generador-codigo.service';

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
        categoriaRel: true,
        marcaRel: true,
        subCategoria: true,
      },
    });
  }

  // 📋 Listar productos
  async productos(params: any) {
    return this.prisma.productos.findMany({
      ...params,
      include: {
        proveedorRel: true,
        categoriaRel: true,
        subCategoria: true,
        marcaRel: true,
      },
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
  async createProductos(data: any): Promise<Productos> {
    const existeProducto = await this.prisma.productos.findUnique({
      where: { codigo: data.codigo },
    });

    if (existeProducto) {
      throw new BadRequestException('El producto ya existe');
    }

    const categoriaId = Number(data.categoria);
    const proveedorId = Number(data.proveedor);
    const marcaId = Number(data.marca);
    const subCategoriaId = data.subCategoria ? Number(data.subCategoria) : null;

    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new BadRequestException('La categoría no existe');
    }

    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id: proveedorId },
    });

    if (!proveedor) {
      throw new BadRequestException('El proveedor no existe');
    }

    const marca = await this.prisma.marca.findUnique({
      where: { id: marcaId },
    });

    if (!marca) {
      throw new BadRequestException('La marca no existe');
    }

    if (marca.proveedorId !== proveedor.id) {
      throw new BadRequestException('La marca no pertenece a ese proveedor');
    }

    const relacion = await this.prisma.categoriaProveedores.findUnique({
      where: {
        categoriaId_proveedorId: {
          categoriaId: categoria.id,
          proveedorId: proveedor.id,
        },
      },
    });

    if (!relacion) {
      throw new BadRequestException(
        'El proveedor no pertenece a la categoría seleccionada',
      );
    }

    let subCategoria: {
      id: number;
      categoriaId: number;
    } | null = null;

    if (subCategoriaId) {
      subCategoria = await this.prisma.subCategoria.findUnique({
        where: { id: subCategoriaId },
      });

      if (!subCategoria) {
        throw new BadRequestException('La subcategoría no existe');
      }

      if (subCategoria.categoriaId !== categoria.id) {
        throw new BadRequestException(
          'La subcategoría no pertenece a la categoría seleccionada',
        );
      }
    }

    const productoID = await this.generarProductoID();

    return this.prisma.productos.create({
      data: {
        codigo: data.codigo,
        codigoProveedor: data.codigoProveedor,
        codigoProducto: data.codigoProducto,
        producto: data.producto,
        costoCompra: data.costoCompra,
        costoVenta: data.costoVenta,
        precio: data.precio,
        descuento: data.descuento ?? 0,
        descripcion: data.descripcion ?? '',
        productoID,
        imagenUrl: data.imagenUrl ?? '',
        categoriaRel: { connect: { id: categoria.id } },
        proveedorRel: { connect: { id: proveedor.id } },
        marcaRel: { connect: { id: marca.id } },
        ...(subCategoria && {
          subCategoria: {
            connect: { id: subCategoria.id },
          },
        }),
      },
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
          { codigoProveedor: { contains: q, mode: 'insensitive' } },
          { codigoProducto: { contains: q, mode: 'insensitive' } },
          { producto: { contains: q, mode: 'insensitive' } },
          { descripcion: { contains: q, mode: 'insensitive' } },

          {
            proveedorRel: {
              proveedor: { contains: q, mode: 'insensitive' },
            },
          },
          {
            categoriaRel: {
              nombre: { contains: q, mode: 'insensitive' },
            },
          },
          {
            marcaRel: {
              nombre: { contains: q, mode: 'insensitive' },
            },
          },
          {
            subCategoria: {
              nombre: { contains: q, mode: 'insensitive' },
            },
          },
        ],
      },
      include: {
        proveedorRel: true,
        categoriaRel: true,
        marcaRel: true,
        subCategoria: true,
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

  async obtenerUbicaciones(
    productoCodigo: string,
    almacenId: number,
    cantidad: number,
  ) {
    return this.prisma.inventario.findMany({
      where: {
        productoCodigo: String(productoCodigo),
        cantidad: {
          gte: cantidad,
        },
        ubicacionRel: {
          almacenId: Number(almacenId),
        },
      },
      include: {
        ubicacionRel: true,
      },
    });
  }

  async filtrarProductos(query: any) {
    const { q, categoriaId, proveedorId, marcaId } = query;

    return this.prisma.productos.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { codigo: { contains: q, mode: 'insensitive' } },
                  { codigoProveedor: { contains: q, mode: 'insensitive' } },
                  { codigoProducto: { contains: q, mode: 'insensitive' } },
                  { producto: { contains: q, mode: 'insensitive' } },
                  { descripcion: { contains: q, mode: 'insensitive' } },

                  {
                    proveedorRel: {
                      proveedor: { contains: q, mode: 'insensitive' },
                    },
                  },
                  {
                    categoriaRel: {
                      nombre: { contains: q, mode: 'insensitive' },
                    },
                  },
                  {
                    marcaRel: {
                      nombre: { contains: q, mode: 'insensitive' },
                    },
                  },
                  {
                    subCategoria: {
                      nombre: { contains: q, mode: 'insensitive' },
                    },
                  },
                ],
              }
            : {},

          categoriaId ? { categoriaId: Number(categoriaId) } : {},
          proveedorId ? { proveedorId: Number(proveedorId) } : {},
          marcaId ? { marcaId: Number(marcaId) } : {},
        ],
      },
      include: {
        proveedorRel: true,
        categoriaRel: true,
        marcaRel: true,
        subCategoria: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }
}

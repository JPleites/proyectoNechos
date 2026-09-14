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
  async updateProductos(
    codigo: string,
    data: {
      codigoProveedor?: string;
      codigoProducto?: string;
      producto?: string;
      costoCompra?: number;
      costoVenta?: number;
      precio?: number;
      descuento?: number;
      descripcion?: string;
      imagenUrl?: string;
      proveedor?: number | string;
      marca?: number | string;
      categoria?: number | string;
      subCategoria?: number | string | null;
    },
  ): Promise<Productos> {
    const producto = await this.prisma.productos.findUnique({
      where: { codigo },
    });

    if (!producto) {
      throw new BadRequestException('Producto no encontrado');
    }

    const categoriaId =
      data.categoria !== undefined
        ? Number(data.categoria)
        : producto.categoriaId;

    const proveedorId =
      data.proveedor !== undefined
        ? Number(data.proveedor)
        : producto.proveedorId;

    const marcaId =
      data.marca !== undefined ? Number(data.marca) : producto.marcaId;

    const subCategoriaId =
      data.subCategoria !== undefined
        ? data.subCategoria
          ? Number(data.subCategoria)
          : null
        : producto.subCategoriaId;

    // =========================
    // VALIDAR CATEGORÍA
    // =========================

    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new BadRequestException('La categoría no existe');
    }

    // =========================
    // VALIDAR PROVEEDOR
    // =========================

    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id: proveedorId },
    });

    if (!proveedor) {
      throw new BadRequestException('El proveedor no existe');
    }

    // =========================
    // VALIDAR MARCA
    // =========================

    const marca = await this.prisma.marca.findUnique({
      where: { id: marcaId },
    });

    if (!marca) {
      throw new BadRequestException('La marca no existe');
    }

    if (marca.proveedorId !== proveedor.id) {
      throw new BadRequestException('La marca no pertenece a ese proveedor');
    }

    // =========================
    // VALIDAR CATEGORÍA + PROVEEDOR
    // =========================

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

    // =========================
    // VALIDAR SUBCATEGORÍA
    // =========================

    if (subCategoriaId !== null) {
      const subCategoria = await this.prisma.subCategoria.findUnique({
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

    // =========================
    // CONSTRUIR DATOS A ACTUALIZAR
    // =========================

    const datosActualizacion: Prisma.ProductosUpdateInput = {
      ...(data.codigoProveedor !== undefined && {
        codigoProveedor: data.codigoProveedor,
      }),

      ...(data.codigoProducto !== undefined && {
        codigoProducto: data.codigoProducto,
      }),

      ...(data.producto !== undefined && {
        producto: data.producto,
      }),

      ...(data.costoCompra !== undefined && {
        costoCompra: Number(data.costoCompra),
      }),

      ...(data.costoVenta !== undefined && {
        costoVenta: Number(data.costoVenta),
      }),

      ...(data.precio !== undefined && {
        precio: Number(data.precio),
      }),

      ...(data.descuento !== undefined && {
        descuento: Number(data.descuento),
      }),

      ...(data.descripcion !== undefined && {
        descripcion: data.descripcion,
      }),

      ...(data.imagenUrl !== undefined && {
        imagenUrl: data.imagenUrl,
      }),

      categoriaRel: {
        connect: { id: categoria.id },
      },

      proveedorRel: {
        connect: { id: proveedor.id },
      },

      marcaRel: {
        connect: { id: marca.id },
      },

      ...(subCategoriaId !== null
        ? {
            subCategoria: {
              connect: { id: subCategoriaId },
            },
          }
        : {
            subCategoria: {
              disconnect: true,
            },
          }),
    };

    return this.prisma.productos.update({
      where: { codigo },
      data: datosActualizacion,
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
    const ubicaciones = await this.prisma.ubicaciones.findMany({
      where: {
        almacenId,
        inventario: {
          some: {
            productoCodigo,
            cantidad: {
              gt: 0,
            },
          },
        },
      },
      include: {
        inventario: {
          where: {
            productoCodigo,
          },
        },
      },
      orderBy: [{ estante: 'asc' }, { nivel: 'asc' }, { deposito: 'asc' }],
    });

    return ubicaciones
      .map((ubicacion) => {
        const inventario = ubicacion.inventario[0];

        if (!inventario) {
          return null;
        }

        const cantidadReservada = inventario.cantidadReservada ?? 0;

        const cantidadDisponible = inventario.cantidad - cantidadReservada;

        if (cantidadDisponible < cantidad) {
          return null;
        }

        return {
          ubicacion: ubicacion.ubicacion,
          deposito: ubicacion.deposito,
          estante: ubicacion.estante,
          nivel: ubicacion.nivel,
          almacenId: ubicacion.almacenId,

          cantidad: inventario.cantidad,
          cantidadReservada,
          cantidadDisponible,
        };
      })
      .filter(
        (ubicacion): ubicacion is NonNullable<typeof ubicacion> =>
          ubicacion !== null && ubicacion.cantidadDisponible > 0,
      );
  }

  async filtrarProductos(query: any) {
    const { q, categoriaId, proveedorId, marcaId, subCategoriaId } = query;

    const where: any = {};

    if (q) {
      where.OR = [
        { codigo: { contains: q, mode: 'insensitive' } },
        { codigoProveedor: { contains: q, mode: 'insensitive' } },
        { codigoProducto: { contains: q, mode: 'insensitive' } },
        { producto: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (categoriaId) {
      where.categoriaId = Number(categoriaId);
    }

    if (proveedorId) {
      where.proveedorId = Number(proveedorId);
    }

    if (marcaId) {
      where.marcaId = Number(marcaId);
    }

    if (subCategoriaId) {
      where.subCategoriaId = Number(subCategoriaId);
    }

    const productos = await this.prisma.productos.findMany({
      where,
      include: {
        proveedorRel: true,
        categoriaRel: true,
        marcaRel: true,
        subCategoria: true,
        inventario: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return productos.map((producto) => {
      const existencia = producto.inventario.reduce(
        (total, inventario) => total + (inventario.cantidad || 0),
        0,
      );

      return {
        ...producto,
        existencia,
      };
    });
  }
}

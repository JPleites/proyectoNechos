import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Inventario, Prisma } from '@prisma/client';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async inventario(
    inventarioWhereUniqueInput: Prisma.InventarioWhereUniqueInput,
  ): Promise<Inventario | null> {
    return this.prisma.inventario.findUnique({
      where: inventarioWhereUniqueInput,
    });
  }

  async inventarios(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.InventarioWhereUniqueInput;
    where?: Prisma.InventarioWhereInput;
    orderBy?: Prisma.InventarioOrderByWithRelationInput;
  }): Promise<Inventario[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.inventario.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createInventario(
    data: Prisma.InventarioCreateInput,
  ): Promise<Inventario> {
    return this.prisma.inventario.create({
      data,
    });
  }

  async updateInventario(params: {
    where: Prisma.InventarioWhereUniqueInput;
    data: Prisma.InventarioUpdateInput;
  }): Promise<Inventario> {
    const { where, data } = params;
    return this.prisma.inventario.update({
      data,
      where,
    });
  }

  async deleteInventario(
    where: Prisma.InventarioWhereUniqueInput,
  ): Promise<Inventario> {
    return this.prisma.inventario.delete({
      where,
    });
  }

  async ingresoProducto(
    data: {
      productoCodigo: string;
      ubicacion: string;
      cantidad: number;
    },
    usuarioCodigo: number,
  ) {
    const { productoCodigo, ubicacion, cantidad } = data;

    // 🔍 1. Validar producto
    const producto = await this.prisma.productos.findUnique({
      where: { codigo: productoCodigo },
    });

    if (!producto) {
      throw new Error('El producto no existe');
    }

    // 🔍 2. Validar ubicación
    const ubicacionExiste = await this.prisma.ubicaciones.findUnique({
      where: { ubicacion },
    });

    if (!ubicacionExiste) {
      throw new Error('La ubicación no existe');
    }

    // 🔍 3. Verificar si la ubicación ya está ocupada
    const inventarioExistente = await this.prisma.inventario.findUnique({
      where: { ubicacion },
    });

    return await this.prisma.$transaction(async (tx) => {
      let inventario;

      // 🟢 SI NO EXISTE → CREAR
      if (!inventarioExistente) {
        inventario = await tx.inventario.create({
          data: {
            productoCodigo,
            ubicacion,
            cantidad,
          },
        });
      } else {
        // 🔴 Si existe pero es OTRO producto → error
        if (inventarioExistente.productoCodigo !== productoCodigo) {
          throw new Error('La ubicación ya está ocupada por otro producto');
        }

        // 🟡 Si es el mismo producto → SUMAR
        inventario = await tx.inventario.update({
          where: { id: inventarioExistente.id },
          data: {
            cantidad: inventarioExistente.cantidad + cantidad,
          },
        });
      }

      // 📦 4. Registrar movimiento
      await tx.movimientosInventario.create({
        data: {
          productoCodigo,
          tipo: 'ENTRADA',
          cantidad,
          usuarioCodigo,
        },
      });

      return inventario;
    });
  }

  async salidaProducto(
    data: {
      productoCodigo: string;
      ubicacion: string;
      cantidad: number;
    },
    usuarioCodigo: number,
  ) {
    const { productoCodigo, ubicacion, cantidad } = data;

    // 🔍 1. Validar producto
    const producto = await this.prisma.productos.findUnique({
      where: { codigo: productoCodigo },
    });

    if (!producto) {
      throw new Error('El producto no existe');
    }

    // 🔍 2. Validar inventario en esa ubicación
    const inventario = await this.prisma.inventario.findFirst({
      where: {
        productoCodigo,
        ubicacion,
      },
    });

    if (!inventario) {
      throw new Error('No hay inventario en esa ubicación');
    }

    // 🔍 3. Validar stock suficiente
    if (inventario.cantidad < cantidad) {
      throw new Error('Stock insuficiente');
    }

    return await this.prisma.$transaction(async (tx) => {
      let resultado;

      // 🟡 Si queda en 0 → eliminar registro
      if (inventario.cantidad === cantidad) {
        await tx.inventario.delete({
          where: { id: inventario.id },
        });

        resultado = { message: 'Producto agotado en esa ubicación' };
      } else {
        // 🔻 Restar cantidad
        resultado = await tx.inventario.update({
          where: { id: inventario.id },
          data: {
            cantidad: inventario.cantidad - cantidad,
          },
        });
      }

      // 📦 Registrar movimiento
      await tx.movimientosInventario.create({
        data: {
          productoCodigo,
          tipo: 'SALIDA',
          cantidad,
          usuarioCodigo,
        },
      });

      return resultado;
    });
  }

  async kardexProducto(productoCodigo: string) {
    // 🔍 1. Validar producto
    const producto = await this.prisma.productos.findUnique({
      where: { codigo: productoCodigo },
    });

    if (!producto) {
      throw new Error('El producto no existe');
    }

    // 📋 2. Obtener movimientos ordenados
    const movimientos = await this.prisma.movimientosInventario.findMany({
      where: { productoCodigo },
      orderBy: { fecha: 'asc' },
    });

    // 🧠 3. Calcular Kardex
    let stock = 0;

    const kardex = movimientos.map((mov) => {
      let entrada = 0;
      let salida = 0;

      if (mov.tipo === 'ENTRADA') {
        entrada = mov.cantidad;
        stock += mov.cantidad;
      }

      if (mov.tipo === 'SALIDA') {
        salida = mov.cantidad;
        stock -= mov.cantidad;
      }

      return {
        fecha: mov.fecha,
        tipo: mov.tipo,
        cantidad: mov.cantidad,
        codigoUsuario: mov.usuarioCodigo,
        entrada,
        salida,
        stock,
      };
    });

    return {
      producto: producto.producto,
      codigo: producto.codigo,
      kardex,
    };
  }
}

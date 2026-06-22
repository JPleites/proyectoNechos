import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Inventario, Prisma } from '@prisma/client';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  // ==============================
  // 🔍 OBTENER UN INVENTARIO
  // ==============================
  async inventario(params: {
    productoCodigo: string;
    ubicacion: string;
  }): Promise<Inventario | null> {
    const { productoCodigo, ubicacion } = params;

    return this.prisma.inventario.findUnique({
      where: {
        productoCodigo_ubicacion: {
          productoCodigo,
          ubicacion,
        },
      },
      include: {
        producto: true,
        ubicacionRel: true,
      },
    });
  }

  // ==============================
  // 📋 LISTAR INVENTARIO
  // ==============================
  async inventarios(params: {
    skip?: number;
    take?: number;
    where?: Prisma.InventarioWhereInput;
    orderBy?: Prisma.InventarioOrderByWithRelationInput;
  }): Promise<Inventario[]> {
    const { skip, take, where, orderBy } = params;

    return this.prisma.inventario.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        producto: true,
        ubicacionRel: true,
      },
    });
  }

  // ==============================
  // ➕ INGRESO DE PRODUCTO
  // ==============================
  async ingresoProducto(
    data: {
      productoCodigo: string;
      ubicacion: string;
      cantidad: number;
      referencia?: string;
    },
    usuarioCodigo: number,
  ) {
    const { productoCodigo, ubicacion, cantidad, referencia } = data;

    // 🔍 validar producto
    const producto = await this.prisma.productos.findUnique({
      where: { codigo: productoCodigo },
    });

    if (!producto) throw new Error('El producto no existe');

    // 🔍 validar ubicación
    const ubicacionExiste = await this.prisma.ubicaciones.findUnique({
      where: { ubicacion },
    });

    if (!ubicacionExiste) throw new Error('La ubicación no existe');

    const key = {
      productoCodigo_ubicacion: {
        productoCodigo,
        ubicacion,
      },
    };

    return await this.prisma.$transaction(async (tx) => {
      const inventarioExistente = await tx.inventario.findUnique({
        where: key,
      });

      let inventario;

      // 🟢 si no existe → crear
      if (!inventarioExistente) {
        inventario = await tx.inventario.create({
          data: {
            productoCodigo,
            ubicacion,
            cantidad,
          },
        });
      } else {
        // 🟡 sumar cantidad
        inventario = await tx.inventario.update({
          where: key,
          data: {
            cantidad: inventarioExistente.cantidad + cantidad,
          },
        });
      }

      // 📦 movimiento
      await tx.movimientosInventario.create({
        data: {
          productoCodigo,
          tipo: 'ENTRADA',
          cantidad,
          usuarioCodigo,
          referencia,
          ubicacion,
        },
      });

      return inventario;
    });
  }

  // ==============================
  // ➖ SALIDA DE PRODUCTO
  // ==============================
  async salidaProducto(
    data: {
      productoCodigo: string;
      ubicacion: string;
      cantidad: number;
    },
    usuarioCodigo: number,
  ) {
    const { productoCodigo, ubicacion, cantidad } = data;

    const producto = await this.prisma.productos.findUnique({
      where: { codigo: productoCodigo },
    });

    if (!producto) throw new Error('El producto no existe');

    const key = {
      productoCodigo_ubicacion: {
        productoCodigo,
        ubicacion,
      },
    };

    const inventario = await this.prisma.inventario.findUnique({
      where: key,
    });

    if (!inventario) {
      throw new Error('No existe inventario en esa ubicación');
    }

    if (inventario.cantidad < cantidad) {
      throw new Error('Stock insuficiente');
    }

    return await this.prisma.$transaction(async (tx) => {
      let resultado;

      // 🟡 si queda en 0 → eliminar
      if (inventario.cantidad === cantidad) {
        await tx.inventario.delete({
          where: key,
        });

        resultado = { message: 'Producto agotado en esa ubicación' };
      } else {
        resultado = await tx.inventario.update({
          where: key,
          data: {
            cantidad: inventario.cantidad - cantidad,
          },
        });
      }

      // 📦 movimiento
      await tx.movimientosInventario.create({
        data: {
          productoCodigo,
          tipo: 'SALIDA',
          cantidad,
          usuarioCodigo,
          ubicacion,
        },
      });

      return resultado;
    });
  }

  // ==============================
  // 📊 KARDEX POR PRODUCTO
  // ==============================
  async kardexProducto(productoCodigo: string) {
    const producto = await this.prisma.productos.findUnique({
      where: { codigo: productoCodigo },
    });

    if (!producto) throw new Error('El producto no existe');

    const movimientos = await this.prisma.movimientosInventario.findMany({
      where: { productoCodigo },
      orderBy: { fecha: 'asc' },
    });

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
        ubicacion: mov.ubicacion,
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

  // ==============================
  // 📍 UBICACIONES DISPONIBLES
  // ==============================
  async getUbicacionesDisponibles(almacenId: number, productoCodigo: string) {
     const idFiltro = Number(almacenId);

    if (isNaN(idFiltro)) {
      throw new Error('El id del almacén debe ser un número válido');
    }

    return await this.prisma.ubicaciones.findMany({
      where: { 
        almacenId: idFiltro 
      },
      include: { 
        inventario: true 
      },
      orderBy: { 
        estante: 'asc', 
        nivel: 'asc', 
        deposito: 'asc' 
      },
    });
  }
}
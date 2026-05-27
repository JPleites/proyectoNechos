import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeneradorCodigoService } from 'src/common/services/generador-codigo/generador-codigo.service';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  // =========================================================
  // GENERAR ID INTERNO
  // =========================================================
  async generarPedidoID() {
    const last = await this.prisma.pedidos.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    const nextNumber = last ? last.id + 1 : 1;

    return this.codeGen.generate('PED', nextNumber);
  }

  // =========================================================
  // CREAR PEDIDO
  // =========================================================
  async crearPedido(data: any) {
    const { detalles, ...pedidoData } = data;

    if (!detalles || detalles.length === 0) {
      throw new BadRequestException('El pedido no contiene productos');
    }

    return this.prisma.$transaction(async (tx) => {
      // Generar código interno
      const pedidoID = await this.generarPedidoID();

      // Crear pedido
      const pedido = await tx.pedidos.create({
        data: {
          pedidoID,
          clienteID: pedidoData.clienteID || null,
          usuarioCodigo: pedidoData.usuarioCodigo,

          fecha: new Date(),
          estado: 'EN_PROCESO',

          subtotal: pedidoData.subtotal,
          impuesto: pedidoData.impuesto,
          descuento: pedidoData.descuento,
          total: pedidoData.total,
        },
      });

      // Crear detalles
      await tx.pedidoDetalle.createMany({
        data: detalles.map((d: any) => ({
          pedidoID: pedido.id,
          productoCodigo: d.productoCodigo,
          ubicacion: d.ubicacion,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
        })),
      });

      // Retornar pedido completo
      return tx.pedidos.findUnique({
        where: {
          id: pedido.id,
        },
        include: {
          cliente: true,
          usuario: true,
          detalles: {
            include: {
              producto: true,
              ubicacionRel: true,
            },
          },
        },
      });
    });
  }

  // =========================================================
  // LISTAR PEDIDOS
  // =========================================================
  async listarPedidos() {
    return this.prisma.pedidos.findMany({
      include: {
        cliente: true,
        usuario: true,
        detalles: {
          include: {
            producto: true,
            ubicacionRel: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  // =========================================================
  // OBTENER PEDIDO
  // =========================================================
  async obtenerPedido(id: number) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: {
        id,
      },
      include: {
        cliente: true,
        usuario: true,
        detalles: {
          include: {
            producto: true,
            ubicacionRel: true,
          },
        },
      },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    return pedido;
  }

  // =========================================================
  // AGREGAR PRODUCTO
  // =========================================================
  async agregarProducto(pedidoId: number, detalle: any) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: {
        id: pedidoId,
      },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    if (pedido.estado !== 'EN_PROCESO') {
      throw new BadRequestException('No se puede modificar este pedido');
    }

    // Validar producto
    const producto = await this.prisma.productos.findUnique({
      where: {
        codigo: detalle.productoCodigo,
      },
    });

    if (!producto) {
      throw new BadRequestException('Producto no encontrado');
    }

    // Validar inventario
    const inventario = await this.prisma.inventario.findFirst({
      where: {
        productoCodigo: detalle.productoCodigo,
        ubicacion: detalle.ubicacion,
      },
    });

    if (!inventario) {
      throw new BadRequestException('No existe inventario en esa ubicación');
    }

    if (inventario.cantidad < detalle.cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    const subtotal = Number(detalle.cantidad) * Number(detalle.precioUnitario);

    return this.prisma.pedidoDetalle.create({
      data: {
        pedidoID: pedidoId,
        productoCodigo: detalle.productoCodigo,
        ubicacion: detalle.ubicacion,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal,
      },
    });
  }

  // =========================================================
  // ELIMINAR DETALLE
  // =========================================================
  async eliminarDetalle(detalleId: number) {
    const detalle = await this.prisma.pedidoDetalle.findUnique({
      where: {
        id: detalleId,
      },
    });

    if (!detalle) {
      throw new BadRequestException('Detalle no encontrado');
    }

    return this.prisma.pedidoDetalle.delete({
      where: {
        id: detalleId,
      },
    });
  }

  // =========================================================
  // ENVIAR A CAJA
  // =========================================================
  async enviarACaja(id: number) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: {
        id,
      },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    if (pedido.estado !== 'EN_PROCESO') {
      throw new BadRequestException('El pedido no puede enviarse a caja');
    }

    return this.prisma.pedidos.update({
      where: {
        id,
      },
      data: {
        estado: 'EN_CAJA',
      },
    });
  }

  // =========================================================
  // LISTAR PEDIDOS EN CAJA
  // =========================================================
  async listarPedidosEnCaja() {
    return this.prisma.pedidos.findMany({
      where: {
        estado: 'EN_CAJA',
      },
      include: {
        cliente: true,
        usuario: true,
        detalles: {
          include: {
            producto: true,
            ubicacionRel: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  // =========================================================
  // CANCELAR PEDIDO
  // =========================================================
  async cancelarPedido(id: number) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: {
        id,
      },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    if (pedido.estado === 'FACTURADO') {
      throw new BadRequestException('No se puede cancelar un pedido facturado');
    }

    return this.prisma.pedidos.update({
      where: {
        id,
      },
      data: {
        estado: 'CANCELADO',
      },
    });
  }

}

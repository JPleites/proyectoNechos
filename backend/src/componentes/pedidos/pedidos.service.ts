import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeneradorCodigoService } from '../../common/services/generador-codigo/generador-codigo.service';
import { ActualizarPedidoDetalleDto } from './dto/actualizar-pedido-detalle.dto';
import { AgregarPedidoDetalleDto } from './dto/agregar-pedido-detalle.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  private calcularTotales(detalles: { subtotal: any }[], descuento = 0) {
    const total = detalles.reduce(
      (sum, detalle) => sum + Number(detalle.subtotal),
      0,
    );

    const totalConDescuento = total - Number(descuento);

    const subtotal = totalConDescuento / 1.15;

    const impuesto = totalConDescuento - subtotal;

    return {
      subtotal,
      impuesto,
      descuento: Number(descuento),
      total: totalConDescuento,
    };
  }

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
  // CREAR PEDIDO + RESERVAR INVENTARIO
  // =========================================================
  async crearPedido(data: any, usuarioCodigo: number) {
    const { detalles } = data;

    // =======================================================
    // VALIDAR DETALLES
    // =======================================================
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      throw new BadRequestException(
        'El pedido debe contener al menos un producto',
      );
    }

    // =======================================================
    // VALIDAR CLIENTE
    // =======================================================
    const clienteId = Number(data.clienteId);

    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      throw new BadRequestException('El cliente no es válido');
    }

    const cliente = await this.prisma.clientes.findUnique({
      where: {
        id: clienteId,
      },
    });

    if (!cliente) {
      throw new BadRequestException('El cliente no existe');
    }

    // =======================================================
    // VALIDAR USUARIO
    // =======================================================
    const usuario = await this.prisma.usuarios.findUnique({
      where: {
        codigo: usuarioCodigo,
      },
    });

    if (!usuario) {
      throw new BadRequestException('El usuario no existe');
    }

    // =======================================================
    // GENERAR PEDIDO DENTRO DE LA TRANSACCIÓN
    // =======================================================
    return this.prisma.$transaction(
      async (tx) => {
        // =====================================================
        // GENERAR ID DEL PEDIDO
        // =====================================================
        const last = await tx.pedidos.findFirst({
          orderBy: {
            id: 'desc',
          },
        });

        const nextNumber = last ? last.id + 1 : 1;

        const pedidoID = this.codeGen.generate('PED', nextNumber);

        // =====================================================
        // VARIABLES PARA CALCULAR TOTALES
        // =====================================================
        let subtotal = 0;
        let descuento = 0;

        const detallesCrear: {
          pedidoID: number;
          productoCodigo: string;
          ubicacion: string;
          cantidad: number;
          precioUnitario: number;
          subtotal: number;
          descuento: number;
        }[] = [];

        // =====================================================
        // VALIDAR Y RESERVAR CADA PRODUCTO
        // =====================================================
        for (const detalle of detalles) {
          const productoCodigo = String(detalle.productoCodigo ?? '').trim();

          const ubicacion = String(detalle.ubicacion ?? '').trim();

          const cantidad = Number(detalle.cantidad);

          // ---------------------------------------------------
          // VALIDAR PRODUCTO
          // ---------------------------------------------------
          if (!productoCodigo) {
            throw new BadRequestException(
              'El código del producto es obligatorio',
            );
          }

          const producto = await tx.productos.findUnique({
            where: {
              codigo: productoCodigo,
            },
          });

          if (!producto) {
            throw new BadRequestException(
              `El producto ${productoCodigo} no existe`,
            );
          }

          // ---------------------------------------------------
          // VALIDAR UBICACIÓN
          // ---------------------------------------------------
          if (!ubicacion) {
            throw new BadRequestException(
              `Debe indicar una ubicación para ${productoCodigo}`,
            );
          }

          const ubicacionExiste = await tx.ubicaciones.findUnique({
            where: {
              ubicacion,
            },
          });

          if (!ubicacionExiste) {
            throw new BadRequestException(
              `La ubicación ${ubicacion} no existe`,
            );
          }

          // ---------------------------------------------------
          // VALIDAR CANTIDAD
          // ---------------------------------------------------
          if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new BadRequestException(
              `La cantidad de ${productoCodigo} debe ser un entero mayor que 0`,
            );
          }

          // ---------------------------------------------------
          // BUSCAR INVENTARIO
          // ---------------------------------------------------
          const inventario = await tx.inventario.findUnique({
            where: {
              productoCodigo_ubicacion: {
                productoCodigo,
                ubicacion,
              },
            },
          });

          if (!inventario) {
            throw new BadRequestException(
              `No existe inventario de ${productoCodigo} en ${ubicacion}`,
            );
          }

          // ---------------------------------------------------
          // STOCK RESERVADO
          // ---------------------------------------------------
          const cantidadReservada = inventario.cantidadReservada ?? 0;

          // Protección contra datos inconsistentes
          if (
            cantidadReservada < 0 ||
            cantidadReservada > inventario.cantidad
          ) {
            throw new BadRequestException(
              `El inventario de ${productoCodigo} en ${ubicacion} tiene una reserva inválida`,
            );
          }

          // ---------------------------------------------------
          // CALCULAR STOCK DISPONIBLE
          // ---------------------------------------------------
          const stockDisponible = inventario.cantidad - cantidadReservada;

          // ---------------------------------------------------
          // VALIDAR STOCK DISPONIBLE
          // ---------------------------------------------------
          if (stockDisponible < cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para ${productoCodigo} en ${ubicacion}. ` +
                `Disponible: ${stockDisponible}, solicitado: ${cantidad}`,
            );
          }

          // ---------------------------------------------------
          // PRECIO: SIEMPRE DESDE PRODUCTOS
          // ---------------------------------------------------
          const precioUnitario = Number(producto.precio);

          if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
            throw new BadRequestException(
              `El precio del producto ${productoCodigo} no es válido`,
            );
          }

          // ---------------------------------------------------
          // CALCULAR SUBTOTAL
          // ---------------------------------------------------
          const subtotalDetalle = precioUnitario * cantidad;

          // Por ahora no aceptamos descuentos enviados
          // desde Angular.
          const descuentoDetalle = 0;

          subtotal += subtotalDetalle;
          descuento += descuentoDetalle;

          // ---------------------------------------------------
          // RESERVAR INVENTARIO
          // ---------------------------------------------------
          await tx.inventario.update({
            where: {
              id: inventario.id,
            },
            data: {
              cantidadReservada: {
                increment: cantidad,
              },
            },
          });

          // ---------------------------------------------------
          // PREPARAR DETALLE
          // ---------------------------------------------------
          detallesCrear.push({
            pedidoID: 0, // Se asignará después de crear pedido
            productoCodigo,
            ubicacion,
            cantidad,
            precioUnitario,
            subtotal: subtotalDetalle,
            descuento: descuentoDetalle,
          });
        }

        // =====================================================
        // CALCULAR IMPUESTOS Y TOTAL
        // =====================================================

        // 15% de impuesto
        const impuesto = subtotal / 1.15;

        subtotal = subtotal - impuesto;

        const total = subtotal + impuesto - descuento;

        // =====================================================
        // CREAR PEDIDO
        // =====================================================
        const pedido = await tx.pedidos.create({
          data: {
            pedidoID,
            clienteID: clienteId,
            usuarioCodigo,
            fecha: new Date(),
            estado: 'EN_PROCESO',

            subtotal,
            impuesto,
            descuento,
            total,

            aprobado: false,
          },
        });

        // =====================================================
        // CREAR DETALLES
        // =====================================================
        await tx.pedidoDetalle.createMany({
          data: detallesCrear.map((detalle) => ({
            pedidoID: pedido.id,
            productoCodigo: detalle.productoCodigo,
            ubicacion: detalle.ubicacion,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            subtotal: detalle.subtotal,
            descuento: detalle.descuento,
          })),
        });

        // =====================================================
        // RETORNAR PEDIDO COMPLETO
        // =====================================================
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
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
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
  // AGREGAR PRODUCTO AL PEDIDO
  // =========================================================
  async agregarProducto(pedidoId: number, detalle: any) {
    const { productoCodigo, ubicacion, cantidad } = detalle;

    // =====================================================
    // VALIDACIONES BÁSICAS
    // =====================================================

    if (!productoCodigo) {
      throw new BadRequestException('El código del producto es obligatorio');
    }

    if (!ubicacion) {
      throw new BadRequestException('La ubicación es obligatoria');
    }

    const cantidadNumerica = Number(cantidad);

    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      throw new BadRequestException(
        'La cantidad debe ser un número entero mayor que 0',
      );
    }

    // =====================================================
    // BUSCAR PEDIDO
    // =====================================================

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

    // =====================================================
    // BUSCAR PRODUCTO
    // =====================================================

    const producto = await this.prisma.productos.findUnique({
      where: {
        codigo: productoCodigo,
      },
    });

    if (!producto) {
      throw new BadRequestException('Producto no encontrado');
    }

    // =====================================================
    // TRANSACCIÓN
    // =====================================================

    return this.prisma.$transaction(async (tx) => {
      // ===================================================
      // BUSCAR INVENTARIO
      // ===================================================

      const inventario = await tx.inventario.findUnique({
        where: {
          productoCodigo_ubicacion: {
            productoCodigo,
            ubicacion,
          },
        },
      });

      if (!inventario) {
        throw new BadRequestException(
          `No existe inventario del producto ${productoCodigo} en la ubicación ${ubicacion}`,
        );
      }

      // ===================================================
      // STOCK DISPONIBLE
      // ===================================================

      const reservadoActual = inventario.cantidadReservada ?? 0;

      const stockDisponible = inventario.cantidad - reservadoActual;

      if (stockDisponible < cantidadNumerica) {
        throw new BadRequestException(
          `Stock disponible insuficiente. Disponible: ${stockDisponible}`,
        );
      }

      // ===================================================
      // PRECIO REAL DEL PRODUCTO
      // ===================================================

      const precioUnitario = Number(producto.precio);

      if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
        throw new BadRequestException('El producto tiene un precio inválido');
      }

      // ===================================================
      // CALCULAR SUBTOTAL
      // ===================================================

      const subtotal = cantidadNumerica * precioUnitario;

      // ===================================================
      // CREAR DETALLE
      // ===================================================

      const nuevoDetalle = await tx.pedidoDetalle.create({
        data: {
          pedidoID: pedidoId,
          productoCodigo,
          ubicacion,
          cantidad: cantidadNumerica,
          precioUnitario,
          subtotal,
        },
        include: {
          producto: true,
          ubicacionRel: true,
        },
      });

      // ===================================================
      // RESERVAR INVENTARIO
      // ===================================================

      await tx.inventario.update({
        where: {
          id: inventario.id,
        },
        data: {
          cantidadReservada: {
            increment: cantidadNumerica,
          },
        },
      });

      // ===================================================
      // RECALCULAR PEDIDO
      // ===================================================

      const detalles = await tx.pedidoDetalle.findMany({
        where: {
          pedidoID: pedidoId,
        },
      });

      const subtotalPedido = detalles.reduce(
        (total, d) => total + Number(d.subtotal),
        0,
      );

      // Por ahora mantenemos la misma lógica de IVA
      // que estás utilizando actualmente: 15%.
      const impuesto = subtotalPedido * 0.15;

      const descuento = Number(pedido.descuento ?? 0);

      const total = subtotalPedido + impuesto - descuento;

      // ===================================================
      // ACTUALIZAR TOTALES DEL PEDIDO
      // ===================================================

      const pedidoActualizado = await tx.pedidos.update({
        where: {
          id: pedidoId,
        },
        data: {
          subtotal: subtotalPedido,
          impuesto,
          descuento,
          total,
        },
      });

      // ===================================================
      // RESPUESTA
      // ===================================================

      return {
        mensaje: 'Producto agregado y stock reservado correctamente',

        detalle: nuevoDetalle,

        reserva: {
          productoCodigo,
          ubicacion,
          cantidadReservada: cantidadNumerica,
          stockDisponibleAnterior: stockDisponible,
          stockDisponibleNuevo: stockDisponible - cantidadNumerica,
        },

        pedido: {
          id: pedidoActualizado.id,
          pedidoID: pedidoActualizado.pedidoID,
          subtotal: pedidoActualizado.subtotal,
          impuesto: pedidoActualizado.impuesto,
          descuento: pedidoActualizado.descuento,
          total: pedidoActualizado.total,
        },
      };
    });
  }

  // =========================================================
  // ELIMINAR DETALLE
  // =========================================================
  async eliminarDetalle(detalleId: number) {
    // =====================================================
    // BUSCAR DETALLE
    // =====================================================

    const detalle = await this.prisma.pedidoDetalle.findUnique({
      where: {
        id: detalleId,
      },
    });

    if (!detalle) {
      throw new BadRequestException('Detalle no encontrado');
    }

    // =====================================================
    // BUSCAR PEDIDO
    // =====================================================

    const pedido = await this.prisma.pedidos.findUnique({
      where: {
        id: detalle.pedidoID,
      },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    // =====================================================
    // VALIDAR ESTADO
    // =====================================================

    if (pedido.estado !== 'EN_PROCESO') {
      throw new BadRequestException(
        'Solo se pueden eliminar productos de pedidos en proceso',
      );
    }

    // =====================================================
    // TRANSACCIÓN
    // =====================================================

    return this.prisma.$transaction(async (tx) => {
      // ===================================================
      // BUSCAR INVENTARIO
      // ===================================================

      const inventario = await tx.inventario.findUnique({
        where: {
          productoCodigo_ubicacion: {
            productoCodigo: detalle.productoCodigo,
            ubicacion: detalle.ubicacion,
          },
        },
      });

      if (!inventario) {
        throw new BadRequestException(
          `No existe inventario del producto ${detalle.productoCodigo} en la ubicación ${detalle.ubicacion}`,
        );
      }

      // ===================================================
      // CANTIDAD RESERVADA
      // ===================================================

      const cantidadReservada = inventario.cantidadReservada ?? 0;

      // ===================================================
      // VALIDAR QUE LA RESERVA SEA CONSISTENTE
      // ===================================================

      if (cantidadReservada < detalle.cantidad) {
        throw new BadRequestException(
          `La reserva del inventario es inconsistente para ${detalle.productoCodigo} en ${detalle.ubicacion}`,
        );
      }

      // ===================================================
      // LIBERAR RESERVA
      // ===================================================

      await tx.inventario.update({
        where: {
          id: inventario.id,
        },
        data: {
          cantidadReservada: {
            decrement: detalle.cantidad,
          },
        },
      });

      // ===================================================
      // ELIMINAR DETALLE
      // ===================================================

      await tx.pedidoDetalle.delete({
        where: {
          id: detalleId,
        },
      });

      // ===================================================
      // OBTENER DETALLES RESTANTES
      // ===================================================

      const detallesRestantes = await tx.pedidoDetalle.findMany({
        where: {
          pedidoID: detalle.pedidoID,
        },
      });

      // ===================================================
      // RECALCULAR SUBTOTAL
      // ===================================================

      const subtotalPedido = detallesRestantes.reduce(
        (total, d) => total + Number(d.subtotal),
        0,
      );

      // ===================================================
      // CALCULAR IMPUESTO
      // =====================================================

      const impuesto = subtotalPedido * 0.15;

      // ===================================================
      // MANTENER DESCUENTO DEL PEDIDO
      // ===================================================

      const descuento = Number(pedido.descuento ?? 0);

      // ===================================================
      // CALCULAR TOTAL
      // ===================================================

      const total = subtotalPedido + impuesto - descuento;

      // ===================================================
      // ACTUALIZAR PEDIDO
      // ===================================================

      const pedidoActualizado = await tx.pedidos.update({
        where: {
          id: detalle.pedidoID,
        },
        data: {
          subtotal: subtotalPedido,
          impuesto,
          descuento,
          total,
        },
      });

      // ===================================================
      // RESPUESTA
      // ===================================================

      return {
        mensaje: 'Detalle eliminado y reserva liberada correctamente',

        detalleEliminado: {
          id: detalle.id,
          productoCodigo: detalle.productoCodigo,
          ubicacion: detalle.ubicacion,
          cantidad: detalle.cantidad,
        },

        reservaLiberada: {
          productoCodigo: detalle.productoCodigo,
          ubicacion: detalle.ubicacion,
          cantidad: detalle.cantidad,

          cantidadReservadaAnterior: cantidadReservada,

          cantidadReservadaNueva: cantidadReservada - detalle.cantidad,
        },

        pedido: {
          id: pedidoActualizado.id,
          pedidoID: pedidoActualizado.pedidoID,
          subtotal: pedidoActualizado.subtotal,
          impuesto: pedidoActualizado.impuesto,
          descuento: pedidoActualizado.descuento,
          total: pedidoActualizado.total,
        },
      };
    });
  }

  // =========================================================
  // ACTUALIZAR CANTIDAD DE DETALLE
  // =========================================================
  async actualizarDetalle(detalleId: number, cantidad: number) {
    // =====================================================
    // VALIDAR CANTIDAD
    // =====================================================

    const nuevaCantidad = Number(cantidad);

    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad <= 0) {
      throw new BadRequestException(
        'La cantidad debe ser un número entero mayor que 0',
      );
    }

    // =====================================================
    // BUSCAR DETALLE
    // =====================================================

    const detalle = await this.prisma.pedidoDetalle.findUnique({
      where: {
        id: detalleId,
      },
    });

    if (!detalle) {
      throw new BadRequestException('Detalle no encontrado');
    }

    // =====================================================
    // BUSCAR PEDIDO
    // =====================================================

    const pedido = await this.prisma.pedidos.findUnique({
      where: {
        id: detalle.pedidoID,
      },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    // =====================================================
    // VALIDAR ESTADO
    // =====================================================

    if (pedido.estado !== 'EN_PROCESO') {
      throw new BadRequestException('No se puede modificar este pedido');
    }

    // =====================================================
    // BUSCAR PRODUCTO
    // =====================================================

    const producto = await this.prisma.productos.findUnique({
      where: {
        codigo: detalle.productoCodigo,
      },
    });

    if (!producto) {
      throw new BadRequestException('Producto no encontrado');
    }

    // =====================================================
    // DIFERENCIA DE CANTIDAD
    // =====================================================

    const cantidadAnterior = detalle.cantidad;

    const diferencia = nuevaCantidad - cantidadAnterior;

    // =====================================================
    // TRANSACCIÓN
    // =====================================================

    return this.prisma.$transaction(async (tx) => {
      // ===================================================
      // BUSCAR INVENTARIO
      // ===================================================

      const inventario = await tx.inventario.findUnique({
        where: {
          productoCodigo_ubicacion: {
            productoCodigo: detalle.productoCodigo,
            ubicacion: detalle.ubicacion,
          },
        },
      });

      if (!inventario) {
        throw new BadRequestException(
          `No existe inventario del producto ${detalle.productoCodigo} en la ubicación ${detalle.ubicacion}`,
        );
      }

      // ===================================================
      // RESERVA ACTUAL
      // ===================================================

      const cantidadReservada = inventario.cantidadReservada ?? 0;

      // ===================================================
      // SI AUMENTA LA CANTIDAD
      // ===================================================

      if (diferencia > 0) {
        const stockDisponible = inventario.cantidad - cantidadReservada;

        if (stockDisponible < diferencia) {
          throw new BadRequestException(
            `Stock disponible insuficiente. Disponible para reservar: ${stockDisponible}`,
          );
        }

        await tx.inventario.update({
          where: {
            id: inventario.id,
          },
          data: {
            cantidadReservada: {
              increment: diferencia,
            },
          },
        });
      }

      // ===================================================
      // SI DISMINUYE LA CANTIDAD
      // =====================================================

      if (diferencia < 0) {
        const cantidadLiberar = Math.abs(diferencia);

        if (cantidadReservada < cantidadLiberar) {
          throw new BadRequestException(
            'La reserva del inventario no es suficiente para reducir este detalle',
          );
        }

        await tx.inventario.update({
          where: {
            id: inventario.id,
          },
          data: {
            cantidadReservada: {
              decrement: cantidadLiberar,
            },
          },
        });
      }

      // ===================================================
      // PRECIO
      // ===================================================

      const precioUnitario = Number(producto.precio);

      if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
        throw new BadRequestException('El producto tiene un precio inválido');
      }

      // ===================================================
      // NUEVO SUBTOTAL DEL DETALLE
      // ===================================================

      const nuevoSubtotal = nuevaCantidad * precioUnitario;

      // ===================================================
      // ACTUALIZAR DETALLE
      // ===================================================

      const detalleActualizado = await tx.pedidoDetalle.update({
        where: {
          id: detalleId,
        },
        data: {
          cantidad: nuevaCantidad,
          precioUnitario,
          subtotal: nuevoSubtotal,
        },
        include: {
          producto: true,
          ubicacionRel: true,
        },
      });

      // ===================================================
      // RECALCULAR TODOS LOS DETALLES
      // ===================================================

      const detalles = await tx.pedidoDetalle.findMany({
        where: {
          pedidoID: detalle.pedidoID,
        },
      });

      const subtotalPedido = detalles.reduce(
        (total, d) => total + Number(d.subtotal),
        0,
      );

      // ===================================================
      // CALCULAR IMPUESTO
      // ===================================================

      const impuesto = subtotalPedido * 0.15;

      // ===================================================
      // DESCUENTO EXISTENTE DEL PEDIDO
      // ===================================================

      const descuento = Number(pedido.descuento ?? 0);

      // ===================================================
      // TOTAL
      // ===================================================

      const total = subtotalPedido + impuesto - descuento;

      // ===================================================
      // ACTUALIZAR PEDIDO
      // ===================================================

      const pedidoActualizado = await tx.pedidos.update({
        where: {
          id: detalle.pedidoID,
        },
        data: {
          subtotal: subtotalPedido,
          impuesto,
          descuento,
          total,
        },
      });

      // ===================================================
      // RESPUESTA
      // ===================================================

      return {
        mensaje: 'Cantidad actualizada correctamente',

        detalle: detalleActualizado,

        reserva: {
          productoCodigo: detalle.productoCodigo,

          ubicacion: detalle.ubicacion,

          cantidadAnterior,

          cantidadNueva: nuevaCantidad,

          diferencia,

          cantidadReservadaAnterior: cantidadReservada,

          cantidadReservadaNueva: cantidadReservada + diferencia,
        },

        pedido: {
          id: pedidoActualizado.id,
          pedidoID: pedidoActualizado.pedidoID,

          subtotal: pedidoActualizado.subtotal,

          impuesto: pedidoActualizado.impuesto,

          descuento: pedidoActualizado.descuento,

          total: pedidoActualizado.total,
        },
      };
    });
  }

  // =========================================================
  // ❌ CANCELAR PEDIDO
  // =========================================================
  async cancelarPedido(id: number) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: {
        id,
      },
      include: {
        detalles: true,
      },
    });

    if (!pedido) {
      throw new BadRequestException('Pedido no encontrado');
    }

    // Solo se pueden cancelar pedidos EN_PROCESO
    if (pedido.estado !== 'EN_PROCESO' && pedido.estado !== 'EN_CAJA') {
      throw new BadRequestException(
        'Solo se pueden cancelar pedidos que estén EN_PROCESO o EN_CAJA',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // =====================================================
      // LIBERAR RESERVAS
      // =====================================================

      for (const detalle of pedido.detalles) {
        const inventario = await tx.inventario.findUnique({
          where: {
            productoCodigo_ubicacion: {
              productoCodigo: detalle.productoCodigo,
              ubicacion: detalle.ubicacion,
            },
          },
        });

        /*
         * Puede ocurrir que el inventario ya no exista.
         *
         * En ese caso no podemos simplemente continuar,
         * porque significaría que la reserva está inconsistente.
         */
        if (!inventario) {
          throw new BadRequestException(
            `No existe inventario para liberar la reserva de ${detalle.productoCodigo} en ${detalle.ubicacion}`,
          );
        }

        const cantidadReservada = inventario.cantidadReservada ?? 0;

        /*
         * La reserva existente debe ser suficiente
         * para cubrir la cantidad del detalle.
         */
        if (cantidadReservada < detalle.cantidad) {
          throw new BadRequestException(
            `La reserva de ${detalle.productoCodigo} en ${detalle.ubicacion} es inconsistente. ` +
              `Reservado: ${cantidadReservada}, requerido: ${detalle.cantidad}`,
          );
        }

        // Liberar únicamente la reserva de este detalle
        await tx.inventario.update({
          where: {
            id: inventario.id,
          },
          data: {
            cantidadReservada: {
              decrement: detalle.cantidad,
            },
          },
        });
      }

      // =====================================================
      // CANCELAR PEDIDO
      // =====================================================

      const pedidoCancelado = await tx.pedidos.update({
        where: {
          id,
        },
        data: {
          estado: 'CANCELADO',
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

      return pedidoCancelado;
    });
  }

  // =========================================================
  // ENVIAR PEDIDO A CAJA
  // =========================================================
  async enviarACaja(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // =====================================================
      // BUSCAR PEDIDO CON SUS DETALLES
      // =====================================================

      const pedido = await tx.pedidos.findUnique({
        where: {
          id,
        },
        include: {
          detalles: true,
        },
      });

      if (!pedido) {
        throw new BadRequestException('Pedido no encontrado');
      }

      // =====================================================
      // VALIDAR ESTADO
      // =====================================================

      if (pedido.estado !== 'EN_PROCESO') {
        throw new BadRequestException(
          `El pedido no puede enviarse a caja porque se encuentra en estado ${pedido.estado}`,
        );
      }

      // =====================================================
      // VALIDAR QUE TENGA PRODUCTOS
      // =====================================================

      if (!pedido.detalles.length) {
        throw new BadRequestException(
          'No se puede enviar a caja un pedido sin productos',
        );
      }

      // =====================================================
      // VALIDAR TODAS LAS RESERVAS
      // =====================================================

      for (const detalle of pedido.detalles) {
        const inventario = await tx.inventario.findUnique({
          where: {
            productoCodigo_ubicacion: {
              productoCodigo: detalle.productoCodigo,
              ubicacion: detalle.ubicacion,
            },
          },
        });

        // ---------------------------------------------------
        // EL INVENTARIO DEBE EXISTIR
        // ---------------------------------------------------

        if (!inventario) {
          throw new BadRequestException(
            `El inventario del producto ${detalle.productoCodigo} ya no existe en la ubicación ${detalle.ubicacion}`,
          );
        }

        // ---------------------------------------------------
        // OBTENER RESERVA
        // ---------------------------------------------------

        const cantidadReservada = inventario.cantidadReservada ?? 0;

        // ---------------------------------------------------
        // VALIDAR QUE LA RESERVA SEA SUFICIENTE
        // ---------------------------------------------------

        if (cantidadReservada < detalle.cantidad) {
          throw new BadRequestException(
            `La reserva del producto ${detalle.productoCodigo} en ${detalle.ubicacion} es insuficiente. Reservado: ${cantidadReservada}, requerido: ${detalle.cantidad}`,
          );
        }

        // ---------------------------------------------------
        // VALIDAR QUE EL STOCK FÍSICO SIGA EXISTIENDO
        // ---------------------------------------------------

        if (inventario.cantidad < detalle.cantidad) {
          throw new BadRequestException(
            `El stock físico del producto ${detalle.productoCodigo} en ${detalle.ubicacion} es insuficiente`,
          );
        }
      }

      // =====================================================
      // CAMBIAR ESTADO
      // =====================================================

      const pedidoActualizado = await tx.pedidos.update({
        where: {
          id,
        },
        data: {
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
      });

      // =====================================================
      // RESPUESTA
      // =====================================================

      return {
        mensaje: 'Pedido enviado a caja correctamente',

        pedido: pedidoActualizado,
      };
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
}

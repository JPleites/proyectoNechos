import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeneradorCodigoService } from '../../common/services/generador-codigo/generador-codigo.service';
import { ActualizarPedidoDetalleDto } from './dto/actualizar-pedido-detalle.dto';
import { AgregarPedidoDetalleDto } from './dto/agregar-pedido-detalle.dto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { Prisma } from '../../generated/prisma/client';
import { SolicitudDescuentoService } from '../descuentos/solicitud-descuento/solicitud-descuento.service';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
    private solicitudDescuentoService: SolicitudDescuentoService,
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
    // TRANSACCIÓN
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
        // VARIABLES
        // =====================================================
        let subtotalBruto = 0;
        let descuentoTotal = 0;

        let requiereAprobacion = false;

        const detallesCrear: {
          productoCodigo: string;
          ubicacion: string;
          cantidad: number;
          precioUnitario: number;
          subtotal: number;
          descuento: number;
        }[] = [];

        // =====================================================
        // VALIDAR Y RESERVAR PRODUCTOS
        // =====================================================
        for (const detalle of detalles) {
          const productoCodigo = String(detalle.productoCodigo ?? '').trim();

          const ubicacion = String(detalle.ubicacion ?? '').trim();

          const cantidad = Number(detalle.cantidad);

          const descuentoUnitario = Number(detalle.descuento ?? 0);

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
          // VALIDAR RESERVA
          // ---------------------------------------------------
          const cantidadReservada = Number(inventario.cantidadReservada ?? 0);

          if (
            cantidadReservada < 0 ||
            cantidadReservada > inventario.cantidad
          ) {
            throw new BadRequestException(
              `El inventario de ${productoCodigo} en ${ubicacion} tiene una reserva inválida`,
            );
          }

          // ---------------------------------------------------
          // STOCK DISPONIBLE
          // ---------------------------------------------------
          const stockDisponible = inventario.cantidad - cantidadReservada;

          if (stockDisponible < cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para ${productoCodigo} en ${ubicacion}. ` +
                `Disponible: ${stockDisponible}, solicitado: ${cantidad}`,
            );
          }

          // ---------------------------------------------------
          // PRECIO DESDE BASE DE DATOS
          // ---------------------------------------------------
          const precioUnitario = Number(producto.precio);

          if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
            throw new BadRequestException(
              `El precio del producto ${productoCodigo} no es válido`,
            );
          }

          // ---------------------------------------------------
          // VALIDAR DESCUENTO
          // ---------------------------------------------------
          if (!Number.isFinite(descuentoUnitario) || descuentoUnitario < 0) {
            throw new BadRequestException(
              `El descuento de ${productoCodigo} no es válido`,
            );
          }

          if (descuentoUnitario >= precioUnitario) {
            throw new BadRequestException(
              `El descuento de ${productoCodigo} debe ser menor que el precio de venta`,
            );
          }

          // ---------------------------------------------------
          // CALCULAR DESCUENTO
          // ---------------------------------------------------
          const porcentajeDescuento =
            (descuentoUnitario / precioUnitario) * 100;

          const precioFinal = precioUnitario - descuentoUnitario;

          // ---------------------------------------------------
          // DETERMINAR APROBACIÓN
          // ---------------------------------------------------
          let nivelAprobacion: string | null = null;

          if (porcentajeDescuento > 50) {
            requiereAprobacion = true;

            if (precioFinal < Number(producto.costoCompra)) {
              nivelAprobacion = 'ADMIN';
            } else {
              nivelAprobacion = 'SUPERVISOR_ADMIN';
            }
          }

          // ---------------------------------------------------
          // TOTALES DEL DETALLE
          // ---------------------------------------------------
          const descuentoDetalle = descuentoUnitario * cantidad;

          const subtotalDetalle =
            (precioUnitario - descuentoUnitario) * cantidad;

          subtotalBruto += precioUnitario * cantidad;
          descuentoTotal += descuentoDetalle;

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
          // GUARDAR INFORMACIÓN DEL DETALLE
          // ---------------------------------------------------
          detallesCrear.push({
            productoCodigo,
            ubicacion,
            cantidad,
            precioUnitario,
            subtotal: subtotalDetalle,
            descuento: descuentoDetalle,
          });

          // Guardamos temporalmente el nivel para crear
          // posteriormente la solicitud.
          (detalle as any)._nivelAprobacion = nivelAprobacion;
          (detalle as any)._porcentajeDescuento = porcentajeDescuento;
          (detalle as any)._precioFinal = precioFinal;
          (detalle as any)._descuentoUnitario = descuentoUnitario;
        }

        // =====================================================
        // TOTAL FINAL CON ISV INCLUIDO
        // =====================================================

        const totalBruto = subtotalBruto - descuentoTotal;

        const subtotal = totalBruto / 1.15;

        const impuesto = totalBruto - subtotal;

        const total = totalBruto;

        // =====================================================
        // ESTADO DEL PEDIDO
        // =====================================================
        const estadoPedido = requiereAprobacion
          ? 'PENDIENTE_APROBACION'
          : 'EN_PROCESO';

        // =====================================================
        // CREAR PEDIDO
        // =====================================================
        const pedido = await tx.pedidos.create({
          data: {
            pedidoID,
            clienteID: clienteId,
            usuarioCodigo,
            fecha: new Date(),
            estado: estadoPedido,

            subtotal,
            impuesto,
            descuento: descuentoTotal,
            total,

            aprobado: !requiereAprobacion,
          },
        });

        // =====================================================
        // CREAR DETALLES Y SOLICITUDES
        // =====================================================
        for (let i = 0; i < detallesCrear.length; i++) {
          const detalleCrear = detallesCrear[i];
          const detalleOriginal = detalles[i];

          const pedidoDetalle = await tx.pedidoDetalle.create({
            data: {
              pedidoID: pedido.id,
              productoCodigo: detalleCrear.productoCodigo,
              ubicacion: detalleCrear.ubicacion,
              cantidad: detalleCrear.cantidad,
              precioUnitario: detalleCrear.precioUnitario,
              subtotal: detalleCrear.subtotal,
              descuento: detalleCrear.descuento,
            },
          });

          const nivelAprobacion = detalleOriginal._nivelAprobacion;

          // ---------------------------------------------------
          // CREAR SOLICITUD SI SUPERA 50%
          // ---------------------------------------------------
          if (nivelAprobacion) {
            const producto = await tx.productos.findUnique({
              where: {
                codigo: detalleCrear.productoCodigo,
              },
            });

            if (!producto) {
              throw new BadRequestException(
                `El producto ${detalleCrear.productoCodigo} no existe`,
              );
            }

            const solicitudID = this.codeGen.generate('SOL', pedidoDetalle.id);

            await tx.solicitudDescuento.create({
              data: {
                solicitudID,

                pedidoDetalleId: pedidoDetalle.id,
                pedidoId: pedido.id,
                productoCodigo: detalleCrear.productoCodigo,

                vendedorCodigo: usuarioCodigo,

                precioLista: detalleCrear.precioUnitario,

                costoCompra: Number(producto.costoCompra),

                porcentajeSolicitado: detalleOriginal._porcentajeDescuento,

                descuentoSolicitado: detalleOriginal._descuentoUnitario,

                precioFinal: detalleOriginal._precioFinal,

                nivelAprobacion,

                estado: 'PENDIENTE',
              },
            });
          }
        }

        // =====================================================
        // RETORNAR PEDIDO COMPLETO
        // =====================================================
        return tx.pedidos.findUnique({
          where: {
            id: pedido.id,
          },
          include: {
            cliente: true,
            usuario: {
              include: {
                perfil: true,
              },
            },
            detalles: {
              include: {
                producto: true,
                ubicacionRel: true,
              },
            },
            solicitudDescuento: true,
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

        usuario: {
          include: {
            perfil: true,
          },
        },

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
      where: { id },

      include: {
        cliente: true,

        usuario: {
          include: {
            perfil: true,
          },
        },

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
    return this.prisma.$transaction(
      async (tx) => {
        // =====================================================
        // BUSCAR PEDIDO
        // =====================================================
        const pedido = await tx.pedidos.findUnique({
          where: {
            id: pedidoId,
          },
        });

        if (!pedido) {
          throw new NotFoundException('El pedido no existe');
        }

        if (pedido.estado !== 'EN_PROCESO') {
          throw new BadRequestException(
            'Solo se pueden agregar productos a pedidos en proceso',
          );
        }

        const productoCodigo = String(detalle.productoCodigo ?? '').trim();

        const ubicacion = String(detalle.ubicacion ?? '').trim();

        const cantidad = Number(detalle.cantidad);

        const descuentoUnitario = Number(detalle.descuento ?? 0);

        // =====================================================
        // VALIDACIONES
        // =====================================================
        if (!productoCodigo) {
          throw new BadRequestException(
            'El código del producto es obligatorio',
          );
        }

        if (!ubicacion) {
          throw new BadRequestException('La ubicación es obligatoria');
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
          throw new BadRequestException(
            'La cantidad debe ser un entero mayor que 0',
          );
        }

        const producto = await tx.productos.findUnique({
          where: {
            codigo: productoCodigo,
          },
        });

        if (!producto) {
          throw new NotFoundException(
            `El producto ${productoCodigo} no existe`,
          );
        }

        // =====================================================
        // INVENTARIO
        // =====================================================
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

        const cantidadReservada = Number(inventario.cantidadReservada ?? 0);

        const stockDisponible = inventario.cantidad - cantidadReservada;

        if (stockDisponible < cantidad) {
          throw new BadRequestException(
            `Stock insuficiente. Disponible: ${stockDisponible}`,
          );
        }

        // =====================================================
        // PRECIO
        // =====================================================
        const precioUnitario = Number(producto.precio);

        if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
          throw new BadRequestException(
            `El precio del producto ${productoCodigo} no es válido`,
          );
        }

        // =====================================================
        // DESCUENTO
        // =====================================================
        if (!Number.isFinite(descuentoUnitario) || descuentoUnitario < 0) {
          throw new BadRequestException('El descuento no es válido');
        }

        if (descuentoUnitario >= precioUnitario) {
          throw new BadRequestException(
            'El descuento debe ser menor que el precio de venta',
          );
        }

        const porcentajeDescuento = (descuentoUnitario / precioUnitario) * 100;

        const precioFinal = precioUnitario - descuentoUnitario;

        let nivelAprobacion: string | null = null;

        if (porcentajeDescuento > 50) {
          nivelAprobacion =
            precioFinal < Number(producto.costoCompra)
              ? 'ADMIN'
              : 'SUPERVISOR_ADMIN';
        }

        // =====================================================
        // CREAR DETALLE
        // =====================================================
        const descuentoDetalle = descuentoUnitario * cantidad;

        const subtotalDetalle = (precioUnitario - descuentoUnitario) * cantidad;

        const pedidoDetalle = await tx.pedidoDetalle.create({
          data: {
            pedidoID: pedido.id,
            productoCodigo,
            ubicacion,
            cantidad,
            precioUnitario,
            subtotal: subtotalDetalle,
            descuento: descuentoDetalle,
          },
        });

        // =====================================================
        // RESERVAR INVENTARIO
        // =====================================================
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

        // =====================================================
        // CREAR SOLICITUD SI ES NECESARIO
        // =====================================================
        if (nivelAprobacion) {
          const solicitudID = this.codeGen.generate('SOL', pedidoDetalle.id);

          await tx.solicitudDescuento.create({
            data: {
              solicitudID,
              pedidoDetalleId: pedidoDetalle.id,
              pedidoId: pedido.id,
              productoCodigo,
              vendedorCodigo: pedido.usuarioCodigo,

              precioLista: precioUnitario,
              costoCompra: Number(producto.costoCompra),
              porcentajeSolicitado: porcentajeDescuento,
              descuentoSolicitado: descuentoUnitario,
              precioFinal,

              nivelAprobacion,
              estado: 'PENDIENTE',
            },
          });
        }

        // =====================================================
        // RECALCULAR PEDIDO
        // =====================================================
        const detalles = await tx.pedidoDetalle.findMany({
          where: {
            pedidoID: pedido.id,
          },
        });

        const subtotalBruto = detalles.reduce(
          (sum, d) => sum + Number(d.precioUnitario) * Number(d.cantidad),
          0,
        );

        const descuentoTotal = detalles.reduce(
          (sum, d) => sum + Number(d.descuento),
          0,
        );

        const totalBruto = subtotalBruto - descuentoTotal;

        const subtotal = totalBruto / 1.15;

        const impuesto = totalBruto - subtotal;

        const total = totalBruto;

        // =====================================================
        // VERIFICAR SOLICITUDES PENDIENTES
        // =====================================================
        const solicitudesPendientes = await tx.solicitudDescuento.count({
          where: {
            pedidoId: pedido.id,
            estado: 'PENDIENTE',
          },
        });

        const aprobado = solicitudesPendientes === 0;

        await tx.pedidos.update({
          where: {
            id: pedido.id,
          },
          data: {
            subtotal,
            impuesto,
            descuento: descuentoTotal,
            total,
            aprobado,
            estado: aprobado ? 'EN_PROCESO' : 'PENDIENTE_APROBACION',
          },
        });

        return tx.pedidos.findUnique({
          where: {
            id: pedido.id,
          },
          include: {
            cliente: true,
            usuario: {
              include: {
                perfil: true,
              },
            },
            detalles: {
              include: {
                producto: true,
                ubicacionRel: true,
              },
            },
            solicitudDescuento: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  // =========================================================
  // ELIMINAR DETALLE
  // =========================================================
  async eliminarDetalle(detalleId: number) {
    return this.prisma.$transaction(
      async (tx) => {
        // =====================================================
        // BUSCAR DETALLE
        // =====================================================
        const detalle = await tx.pedidoDetalle.findUnique({
          where: {
            id: detalleId,
          },
          include: {
            pedido: true,
          },
        });

        if (!detalle) {
          throw new NotFoundException('El detalle del pedido no existe');
        }

        // =====================================================
        // VALIDAR ESTADO DEL PEDIDO
        // =====================================================
        if (detalle.pedido.estado !== 'EN_PROCESO') {
          throw new BadRequestException(
            'Solo se pueden eliminar productos de pedidos en proceso',
          );
        }

        // =====================================================
        // BUSCAR INVENTARIO
        // =====================================================
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
            `No existe inventario de ${detalle.productoCodigo} en ${detalle.ubicacion}`,
          );
        }

        // =====================================================
        // VALIDAR RESERVA
        // =====================================================
        const cantidadReservada = Number(inventario.cantidadReservada ?? 0);

        if (cantidadReservada < detalle.cantidad) {
          throw new BadRequestException(
            `La reserva de ${detalle.productoCodigo} es insuficiente`,
          );
        }

        // =====================================================
        // LIBERAR RESERVA
        // =====================================================
        const nuevaReserva = cantidadReservada - detalle.cantidad;

        await tx.inventario.update({
          where: {
            id: inventario.id,
          },
          data: {
            cantidadReservada: nuevaReserva,
          },
        });

        // =====================================================
        // ELIMINAR SOLICITUD DE DESCUENTO
        // =====================================================
        await tx.solicitudDescuento.deleteMany({
          where: {
            pedidoDetalleId: detalle.id,
          },
        });

        // =====================================================
        // ELIMINAR DETALLE
        // =====================================================
        await tx.pedidoDetalle.delete({
          where: {
            id: detalle.id,
          },
        });

        // =====================================================
        // OBTENER DETALLES RESTANTES
        // =====================================================
        const detalles = await tx.pedidoDetalle.findMany({
          where: {
            pedidoID: detalle.pedido.id,
          },
        });

        // =====================================================
        // SI NO QUEDAN PRODUCTOS
        // =====================================================
        if (detalles.length === 0) {
          await tx.pedidos.update({
            where: {
              id: detalle.pedido.id,
            },
            data: {
              subtotal: 0,
              impuesto: 0,
              descuento: 0,
              total: 0,
              aprobado: false,
            },
          });

          return tx.pedidos.findUnique({
            where: {
              id: detalle.pedido.id,
            },
            include: {
              cliente: true,
              usuario: {
                include: {
                  perfil: true,
                },
              },
              detalles: {
                include: {
                  producto: true,
                  ubicacionRel: true,
                },
              },
              solicitudDescuento: true,
            },
          });
        }

        // =====================================================
        // RECALCULAR TOTALES
        // =====================================================
        const subtotalBruto = detalles.reduce(
          (sum, d) => sum + Number(d.precioUnitario) * Number(d.cantidad),
          0,
        );

        const descuentoTotal = detalles.reduce(
          (sum, d) => sum + Number(d.descuento),
          0,
        );

        const totalBruto = subtotalBruto - descuentoTotal;

        const subtotal = totalBruto / 1.15;

        const impuesto = totalBruto - subtotal;

        const total = totalBruto;

        // =====================================================
        // VERIFICAR SOLICITUDES PENDIENTES
        // =====================================================
        const solicitudesPendientes = await tx.solicitudDescuento.count({
          where: {
            pedidoId: detalle.pedido.id,
            estado: 'PENDIENTE',
          },
        });

        const solicitudesRechazadas = await tx.solicitudDescuento.count({
          where: {
            pedidoId: detalle.pedido.id,
            estado: 'RECHAZADA',
          },
        });

        const aprobado =
          solicitudesPendientes === 0 && solicitudesRechazadas === 0;

        // =====================================================
        // ACTUALIZAR PEDIDO
        // =====================================================
        await tx.pedidos.update({
          where: {
            id: detalle.pedido.id,
          },
          data: {
            subtotal,
            impuesto,
            descuento: descuentoTotal,
            total,
            aprobado,
            estado: aprobado ? 'EN_PROCESO' : 'PENDIENTE_APROBACION',
          },
        });

        // =====================================================
        // RETORNAR PEDIDO
        // =====================================================
        return tx.pedidos.findUnique({
          where: {
            id: detalle.pedido.id,
          },
          include: {
            cliente: true,
            usuario: {
              include: {
                perfil: true,
              },
            },
            detalles: {
              include: {
                producto: true,
                ubicacionRel: true,
              },
            },
            solicitudDescuento: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  // =========================================================
  // ACTUALIZAR CANTIDAD DE DETALLE
  // =========================================================
  async actualizarDetalle(
    detalleId: number,
    data: {
      cantidad: number;
      descuento?: number;
    },
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        // =====================================================
        // BUSCAR DETALLE
        // =====================================================
        const detalle = await tx.pedidoDetalle.findUnique({
          where: {
            id: detalleId,
          },
          include: {
            pedido: true,
            producto: true,
          },
        });

        if (!detalle) {
          throw new NotFoundException('El detalle del pedido no existe');
        }

        if (detalle.pedido.estado !== 'EN_PROCESO') {
          throw new BadRequestException(
            'Solo se pueden modificar detalles de pedidos en proceso',
          );
        }

        const nuevaCantidad = Number(data.cantidad);

        const nuevoDescuento = Number(data.descuento ?? 0);

        // =====================================================
        // VALIDAR CANTIDAD
        // =====================================================
        if (!Number.isInteger(nuevaCantidad) || nuevaCantidad <= 0) {
          throw new BadRequestException(
            'La cantidad debe ser un entero mayor que 0',
          );
        }

        // =====================================================
        // PRECIO
        // =====================================================
        const precioUnitario = Number(detalle.producto.precio);

        if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
          throw new BadRequestException('El precio del producto no es válido');
        }

        // =====================================================
        // VALIDAR DESCUENTO
        // =====================================================
        if (!Number.isFinite(nuevoDescuento) || nuevoDescuento < 0) {
          throw new BadRequestException('El descuento no es válido');
        }

        if (nuevoDescuento >= precioUnitario) {
          throw new BadRequestException(
            'El descuento debe ser menor que el precio de venta',
          );
        }

        // =====================================================
        // CALCULAR STOCK
        // =====================================================
        const diferencia = nuevaCantidad - detalle.cantidad;

        if (diferencia !== 0) {
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
              'No existe inventario para este producto y ubicación',
            );
          }

          const cantidadReservada = Number(inventario.cantidadReservada ?? 0);

          if (diferencia > 0) {
            const stockDisponible = inventario.cantidad - cantidadReservada;

            if (stockDisponible < diferencia) {
              throw new BadRequestException(
                `Stock insuficiente. Disponible: ${stockDisponible}`,
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
          } else {
            const cantidadLiberar = Math.abs(diferencia);

            if (cantidadReservada < cantidadLiberar) {
              throw new BadRequestException(
                'La reserva de inventario es insuficiente',
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
        }

        // =====================================================
        // CALCULAR DESCUENTO
        // =====================================================
        const porcentajeDescuento = (nuevoDescuento / precioUnitario) * 100;

        const precioFinal = precioUnitario - nuevoDescuento;

        let nivelAprobacion: string | null = null;

        if (porcentajeDescuento > 50) {
          nivelAprobacion =
            precioFinal < Number(detalle.producto.costoCompra)
              ? 'ADMIN'
              : 'SUPERVISOR_ADMIN';
        }

        // =====================================================
        // ELIMINAR SOLICITUD ANTERIOR
        // =====================================================
        await tx.solicitudDescuento.deleteMany({
          where: {
            pedidoDetalleId: detalle.id,
          },
        });

        // =====================================================
        // ACTUALIZAR DETALLE
        // =====================================================
        const nuevoDescuentoTotal = nuevoDescuento * nuevaCantidad;

        const nuevoSubtotal = (precioUnitario - nuevoDescuento) * nuevaCantidad;

        await tx.pedidoDetalle.update({
          where: {
            id: detalle.id,
          },
          data: {
            cantidad: nuevaCantidad,
            precioUnitario,
            subtotal: nuevoSubtotal,
            descuento: nuevoDescuentoTotal,
          },
        });

        // =====================================================
        // CREAR NUEVA SOLICITUD
        // =====================================================
        if (nivelAprobacion) {
          const solicitudID = this.codeGen.generate('SOL', detalle.id);

          await tx.solicitudDescuento.create({
            data: {
              solicitudID,

              pedidoDetalleId: detalle.id,
              pedidoId: detalle.pedido.id,
              productoCodigo: detalle.productoCodigo,

              vendedorCodigo: detalle.pedido.usuarioCodigo,

              precioLista: precioUnitario,

              costoCompra: Number(detalle.producto.costoCompra),

              porcentajeSolicitado: porcentajeDescuento,

              descuentoSolicitado: nuevoDescuento,

              precioFinal,

              nivelAprobacion,

              estado: 'PENDIENTE',
            },
          });
        }

        // =====================================================
        // RECALCULAR PEDIDO
        // =====================================================
        const detalles = await tx.pedidoDetalle.findMany({
          where: {
            pedidoID: detalle.pedido.id,
          },
        });

        const subtotalBruto = detalles.reduce(
          (sum, d) => sum + Number(d.precioUnitario) * Number(d.cantidad),
          0,
        );

        const descuentoTotal = detalles.reduce(
          (sum, d) => sum + Number(d.descuento),
          0,
        );

        const totalBruto = subtotalBruto - descuentoTotal;

        const subtotal = totalBruto / 1.15;

        const impuesto = totalBruto - subtotal;

        const total = totalBruto;

        // =====================================================
        // SOLICITUDES PENDIENTES
        // =====================================================
        const pendientes = await tx.solicitudDescuento.count({
          where: {
            pedidoId: detalle.pedido.id,
            estado: 'PENDIENTE',
          },
        });

        const aprobado = pendientes === 0;

        await tx.pedidos.update({
          where: {
            id: detalle.pedido.id,
          },
          data: {
            subtotal,
            impuesto,
            descuento: descuentoTotal,
            total,
            aprobado,
            estado: aprobado ? 'EN_PROCESO' : 'PENDIENTE_APROBACION',
          },
        });

        return tx.pedidos.findUnique({
          where: {
            id: detalle.pedido.id,
          },
          include: {
            cliente: true,
            usuario: {
              include: {
                perfil: true,
              },
            },
            detalles: {
              include: {
                producto: true,
                ubicacionRel: true,
              },
            },
            solicitudDescuento: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
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
    return this.prisma.$transaction(
      async (tx) => {
        // =====================================================
        // BUSCAR PEDIDO
        // =====================================================
        const pedido = await tx.pedidos.findUnique({
          where: {
            id,
          },
          include: {
            detalles: true,
            solicitudDescuento: true,
          },
        });

        if (!pedido) {
          throw new NotFoundException('El pedido no existe');
        }

        // =====================================================
        // VALIDAR ESTADO
        // =====================================================
        if (pedido.estado !== 'EN_PROCESO') {
          throw new BadRequestException(
            'Solo se pueden enviar a caja pedidos en proceso',
          );
        }

        // =====================================================
        // VALIDAR APROBACIÓN
        // =====================================================
        if (!pedido.aprobado) {
          throw new BadRequestException('El pedido aún no ha sido aprobado');
        }

        // =====================================================
        // VALIDAR SOLICITUDES DE DESCUENTO
        // =====================================================
        const solicitudesPendientes = pedido.solicitudDescuento.filter(
          (solicitud) => solicitud.estado === 'PENDIENTE',
        );

        if (solicitudesPendientes.length > 0) {
          throw new BadRequestException(
            'El pedido tiene solicitudes de descuento pendientes de aprobación',
          );
        }

        const solicitudesRechazadas = pedido.solicitudDescuento.filter(
          (solicitud) => solicitud.estado === 'RECHAZADA',
        );

        if (solicitudesRechazadas.length > 0) {
          throw new BadRequestException(
            'El pedido contiene solicitudes de descuento rechazadas',
          );
        }

        // =====================================================
        // VALIDAR DETALLES
        // =====================================================
        if (!pedido.detalles || pedido.detalles.length === 0) {
          throw new BadRequestException('El pedido no contiene productos');
        }

        // =====================================================
        // VALIDAR RESERVAS
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

          if (!inventario) {
            throw new BadRequestException(
              `No existe inventario para ${detalle.productoCodigo} en ${detalle.ubicacion}`,
            );
          }

          const cantidadReservada = Number(inventario.cantidadReservada ?? 0);

          if (cantidadReservada < detalle.cantidad) {
            throw new BadRequestException(
              `La reserva de ${detalle.productoCodigo} es insuficiente`,
            );
          }

          if (inventario.cantidad < detalle.cantidad) {
            throw new BadRequestException(
              `El stock físico de ${detalle.productoCodigo} es insuficiente`,
            );
          }
        }

        // =====================================================
        // ENVIAR A CAJA
        // =====================================================
        await tx.pedidos.update({
          where: {
            id,
          },
          data: {
            estado: 'EN_CAJA',
          },
        });

        // =====================================================
        // RETORNAR PEDIDO
        // =====================================================
        return tx.pedidos.findUnique({
          where: {
            id,
          },
          include: {
            cliente: true,
            usuario: {
              include: {
                perfil: true,
              },
            },
            detalles: {
              include: {
                producto: true,
                ubicacionRel: true,
              },
            },
            solicitudDescuento: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
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

        usuario: {
          include: {
            perfil: true,
          },
        },

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
  // CONSULTAR PEDIDOS
  // =========================================================
  async consultarPedidos(filtros: {
    pedidoID?: string;
    cliente?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: string;
    usuario?: string;
  }) {
    const { pedidoID, cliente, fechaDesde, fechaHasta, estado, usuario } =
      filtros;

    const where: any = {};

    // =======================================================
    // PEDIDO
    // =======================================================

    if (pedidoID?.trim()) {
      where.pedidoID = {
        contains: pedidoID.trim(),
        mode: 'insensitive',
      };
    }

    // =======================================================
    // CLIENTE
    // =======================================================

    if (cliente?.trim()) {
      where.cliente = {
        OR: [
          {
            nombre: {
              contains: cliente.trim(),
              mode: 'insensitive',
            },
          },
          {
            clienteID: {
              contains: cliente.trim(),
              mode: 'insensitive',
            },
          },
          {
            rtn: {
              contains: cliente.trim(),
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    // =======================================================
    // FECHAS
    // =======================================================

    if (fechaDesde || fechaHasta) {
      where.fecha = {};

      if (fechaDesde) {
        const desde = new Date(`${fechaDesde}T00:00:00`);

        if (isNaN(desde.getTime())) {
          throw new BadRequestException('Fecha desde no válida');
        }

        where.fecha.gte = desde;
      }

      if (fechaHasta) {
        const hasta = new Date(`${fechaHasta}T23:59:59.999`);

        if (isNaN(hasta.getTime())) {
          throw new BadRequestException('Fecha hasta no válida');
        }

        where.fecha.lte = hasta;
      }
    }

    // =======================================================
    // ESTADO
    // =======================================================

    if (estado?.trim()) {
      where.estado = estado.trim();
    }

    // =======================================================
    // USUARIO / VENDEDOR
    // =======================================================

    if (usuario?.trim()) {
      const usuarioCodigo = Number(usuario);

      if (Number.isInteger(usuarioCodigo) && usuarioCodigo > 0) {
        where.usuarioCodigo = usuarioCodigo;
      } else {
        where.usuario = {
          perfil: {
            nombre: {
              contains: usuario.trim(),
              mode: 'insensitive',
            },
          },
        };
      }
    }

    // =======================================================
    // CONSULTA
    // =======================================================

    const pedidos = await this.prisma.pedidos.findMany({
      where,

      include: {
        cliente: true,

        usuario: {
          include: {
            perfil: true,
          },
        },

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

    // =======================================================
    // RESPUESTA
    // =======================================================

    return pedidos.map((pedido) => ({
      id: pedido.id,
      pedidoID: pedido.pedidoID,

      clienteID: pedido.clienteID,
      cliente: pedido.cliente.nombre,

      usuarioCodigo: pedido.usuarioCodigo,
      usuario: pedido.usuario?.perfil?.nombre ?? 'N/A',

      fecha: pedido.fecha,
      estado: pedido.estado,

      subtotal: pedido.subtotal,
      impuesto: pedido.impuesto,
      descuento: pedido.descuento,
      total: pedido.total,

      aprobado: pedido.aprobado,

      detalles: pedido.detalles.map((detalle) => ({
        id: detalle.id,
        productoCodigo: detalle.productoCodigo,
        producto: detalle.producto.producto,

        ubicacion: detalle.ubicacion,

        cantidad: detalle.cantidad,

        precioUnitario: detalle.precioUnitario,

        subtotal: detalle.subtotal,

        descuento: detalle.descuento,
      })),
    }));
  }
}

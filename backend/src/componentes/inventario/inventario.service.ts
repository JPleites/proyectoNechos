import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

  async consultarInventario(filtros: {
    productoCodigo?: string;
    ubicacion?: string;
    almacenId?: number;
  }) {
    const where: Prisma.InventarioWhereInput = {};

    if (filtros.productoCodigo) {
      where.productoCodigo = filtros.productoCodigo;
    }

    if (filtros.ubicacion) {
      where.ubicacion = filtros.ubicacion;
    }

    if (filtros.almacenId) {
      where.ubicacionRel = {
        almacenId: Number(filtros.almacenId),
      };
    }

    const inventario = await this.prisma.inventario.findMany({
      where,
      include: {
        producto: true,
        ubicacionRel: {
          include: {
            almacen: true,
          },
        },
      },
      orderBy: [{ productoCodigo: 'asc' }, { ubicacion: 'asc' }],
    });

    return inventario.map((item) => {
      const cantidadReservada = item.cantidadReservada ?? 0;

      const cantidadDisponible = item.cantidad - cantidadReservada;

      return {
        ...item,
        cantidadReservada,
        cantidadDisponible: Math.max(cantidadDisponible, 0),
      };
    });
  }

  // ==============================
  // 📊 KARDEX POR PRODUCTO
  // ==============================
  async kardexProducto(productoCodigo: string, ubicacion?: string) {
    const producto = await this.prisma.productos.findUnique({
      where: {
        codigo: productoCodigo,
      },
    });

    if (!producto) {
      throw new Error('El producto no existe');
    }

    const where: Prisma.MovimientosInventarioWhereInput = {
      productoCodigo,
    };

    // Si se solicita una ubicación específica,
    // solamente obtenemos movimientos que afectan esa ubicación.
    if (ubicacion) {
      where.OR = [
        {
          ubicacion,
        },
        {
          ubicacionOrigen: ubicacion,
        },
        {
          ubicacionDestino: ubicacion,
        },
      ];
    }

    const movimientos = await this.prisma.movimientosInventario.findMany({
      where,
      orderBy: [
        {
          fecha: 'asc',
        },
      ],
    });

    let stock = 0;

    const kardex = movimientos.map((mov) => {
      let entrada = 0;
      let salida = 0;
      let movimientoStock = 0;

      if (mov.tipo === 'ENTRADA') {
        // En Kardex general o si la entrada pertenece
        // a la ubicación consultada.
        if (!ubicacion || mov.ubicacion === ubicacion) {
          entrada = mov.cantidad;
          movimientoStock = mov.cantidad;
        }
      }

      if (mov.tipo === 'SALIDA') {
        // En Kardex general o si la salida pertenece
        // a la ubicación consultada.
        if (!ubicacion || mov.ubicacion === ubicacion) {
          salida = mov.cantidad;
          movimientoStock = -mov.cantidad;
        }
      }

      if (mov.tipo === 'TRANSFERENCIA') {
        // Kardex general:
        // una transferencia no modifica el stock global.
        if (!ubicacion) {
          movimientoStock = 0;
        }

        // Kardex por ubicación:
        // sale de la ubicación origen.
        if (ubicacion && mov.ubicacionOrigen === ubicacion) {
          salida = mov.cantidad;
          movimientoStock = -mov.cantidad;
        }

        // entra a la ubicación destino.
        if (ubicacion && mov.ubicacionDestino === ubicacion) {
          entrada = mov.cantidad;
          movimientoStock = mov.cantidad;
        }
      }

      if (mov.tipo === 'AJUSTE') {
        if (!ubicacion || mov.ubicacion === ubicacion) {
          if (mov.referencia?.startsWith('AJUSTE_ENTRADA:')) {
            entrada = mov.cantidad;
            movimientoStock = mov.cantidad;
          }

          if (mov.referencia?.startsWith('AJUSTE_SALIDA:')) {
            salida = mov.cantidad;
            movimientoStock = -mov.cantidad;
          }
        }
      }

      stock += movimientoStock;

      return {
        fecha: mov.fecha,
        tipo: mov.tipo,
        cantidad: mov.cantidad,

        entrada,
        salida,
        stock,

        ubicacion: mov.ubicacion,
        ubicacionOrigen: mov.ubicacionOrigen,
        ubicacionDestino: mov.ubicacionDestino,

        referencia: mov.referencia,
        usuarioCodigo: mov.usuarioCodigo,
      };
    });

    return {
      producto: producto.producto,
      codigo: producto.codigo,
      ubicacion: ubicacion ?? null,
      kardex,
    };
  }

  // ==============================
  // 📍 UBICACIONES DISPONIBLES
  // ==============================
  async getUbicacionesDisponibles(almacenId: number, productoCodigo: string) {
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

  async transferirProducto(
    productoCodigo: string,
    ubicacionOrigen: string,
    ubicacionDestino: string,
    cantidad: number,
    referencia: string | undefined,
    usuarioCodigo: number,
  ) {
    // 1. Validar producto
    const producto = await this.prisma.productos.findUnique({
      where: {
        codigo: productoCodigo,
      },
    });

    if (!producto) {
      throw new NotFoundException('El producto no existe');
    }

    // 2. Validar ubicación origen
    const origen = await this.prisma.ubicaciones.findUnique({
      where: {
        ubicacion: ubicacionOrigen,
      },
    });

    if (!origen) {
      throw new NotFoundException(
        `La ubicación origen ${ubicacionOrigen} no existe`,
      );
    }

    // 3. Validar ubicación destino
    const destino = await this.prisma.ubicaciones.findUnique({
      where: {
        ubicacion: ubicacionDestino,
      },
    });

    if (!destino) {
      throw new NotFoundException(
        `La ubicación destino ${ubicacionDestino} no existe`,
      );
    }

    // 4. Validar que origen y destino sean diferentes
    if (ubicacionOrigen === ubicacionDestino) {
      throw new BadRequestException(
        'La ubicación origen y destino deben ser diferentes',
      );
    }

    // 5. Validar cantidad
    if (cantidad <= 0 || !Number.isInteger(cantidad)) {
      throw new BadRequestException(
        'La cantidad debe ser un número entero mayor que 0',
      );
    }

    // 6. Ejecutar toda la transferencia dentro de una transacción
    return await this.prisma.$transaction(async (tx) => {
      // Buscar inventario del producto en origen
      const inventarioOrigen = await tx.inventario.findUnique({
        where: {
          productoCodigo_ubicacion: {
            productoCodigo,
            ubicacion: ubicacionOrigen,
          },
        },
      });

      if (!inventarioOrigen) {
        throw new BadRequestException(
          `No existe inventario del producto ${productoCodigo} en ${ubicacionOrigen}`,
        );
      }

      // Validar stock suficiente
      if (inventarioOrigen.cantidad < cantidad) {
        throw new BadRequestException(
          `Stock insuficiente en ${ubicacionOrigen}. Disponible: ${inventarioOrigen.cantidad}`,
        );
      }

      // 7. Restar cantidad del origen
      const nuevaCantidadOrigen = inventarioOrigen.cantidad - cantidad;

      if (nuevaCantidadOrigen === 0) {
        // Si queda en cero, eliminamos el registro
        await tx.inventario.delete({
          where: {
            id: inventarioOrigen.id,
          },
        });
      } else {
        await tx.inventario.update({
          where: {
            id: inventarioOrigen.id,
          },
          data: {
            cantidad: nuevaCantidadOrigen,
          },
        });
      }

      // 8. Buscar inventario del producto en destino
      const inventarioDestino = await tx.inventario.findUnique({
        where: {
          productoCodigo_ubicacion: {
            productoCodigo,
            ubicacion: ubicacionDestino,
          },
        },
      });

      let inventarioDestinoFinal;

      // 9. Actualizar o crear inventario destino
      if (inventarioDestino) {
        inventarioDestinoFinal = await tx.inventario.update({
          where: {
            id: inventarioDestino.id,
          },
          data: {
            cantidad: {
              increment: cantidad,
            },
          },
        });
      } else {
        inventarioDestinoFinal = await tx.inventario.create({
          data: {
            productoCodigo,
            ubicacion: ubicacionDestino,
            cantidad,
          },
        });
      }

      // 10. Crear UN SOLO movimiento
      const movimiento = await tx.movimientosInventario.create({
        data: {
          productoCodigo,
          tipo: 'TRANSFERENCIA',
          cantidad,
          referencia: referencia ?? null,
          usuarioCodigo,
          ubicacion: ubicacionOrigen,
          ubicacionOrigen,
          ubicacionDestino,
        },
      });

      return {
        mensaje: 'Transferencia realizada correctamente',
        productoCodigo,
        ubicacionOrigen,
        ubicacionDestino,
        cantidad,
        inventarioOrigen: {
          ubicacion: ubicacionOrigen,
          cantidad: nuevaCantidadOrigen,
        },
        inventarioDestino: {
          ubicacion: ubicacionDestino,
          cantidad: inventarioDestinoFinal.cantidad,
        },
        movimiento: {
          id: movimiento.id,
          tipo: movimiento.tipo,
          cantidad: movimiento.cantidad,
          ubicacionOrigen: movimiento.ubicacionOrigen,
          ubicacionDestino: movimiento.ubicacionDestino,
          referencia: movimiento.referencia,
          usuarioCodigo: movimiento.usuarioCodigo,
          fecha: movimiento.fecha,
        },
      };
    });
  }
  // ==============================
  // 🛠️ AJUSTE DE INVENTARIO
  // ==============================
  async ajusteInventario(
    data: {
      productoCodigo: string;
      ubicacion: string;
      cantidad: number;
      tipoAjuste: 'ENTRADA' | 'SALIDA';
      motivo: string;
      referencia?: string;
    },
    usuarioCodigo: number,
  ) {
    const {
      productoCodigo,
      ubicacion,
      cantidad,
      tipoAjuste,
      motivo,
      referencia,
    } = data;

    // ==============================
    // 🔍 VALIDACIONES
    // ==============================

    // Validar producto
    const producto = await this.prisma.productos.findUnique({
      where: {
        codigo: productoCodigo,
      },
    });

    if (!producto) {
      throw new NotFoundException('El producto no existe');
    }

    // Validar ubicación
    const ubicacionExiste = await this.prisma.ubicaciones.findUnique({
      where: {
        ubicacion,
      },
    });

    if (!ubicacionExiste) {
      throw new NotFoundException('La ubicación no existe');
    }

    // Validar cantidad
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad debe ser un número entero mayor que 0',
      );
    }

    // Validar tipo de ajuste
    if (tipoAjuste !== 'ENTRADA' && tipoAjuste !== 'SALIDA') {
      throw new BadRequestException(
        'El tipo de ajuste debe ser ENTRADA o SALIDA',
      );
    }

    // Validar motivo
    if (!motivo || !motivo.trim()) {
      throw new BadRequestException('El motivo del ajuste es obligatorio');
    }

    // ==============================
    // 🔄 TRANSACCIÓN
    // ==============================

    return await this.prisma.$transaction(async (tx) => {
      const key = {
        productoCodigo_ubicacion: {
          productoCodigo,
          ubicacion,
        },
      };

      // Buscar inventario existente
      const inventarioExistente = await tx.inventario.findUnique({
        where: key,
      });

      // ==========================================
      // ➕ AJUSTE DE ENTRADA
      // ==========================================

      if (tipoAjuste === 'ENTRADA') {
        let inventario;

        if (!inventarioExistente) {
          // Crear inventario si no existe
          inventario = await tx.inventario.create({
            data: {
              productoCodigo,
              ubicacion,
              cantidad,
            },
          });
        } else {
          // Aumentar inventario existente
          inventario = await tx.inventario.update({
            where: key,
            data: {
              cantidad: {
                increment: cantidad,
              },
            },
          });
        }

        // Crear movimiento
        const movimiento = await tx.movimientosInventario.create({
          data: {
            productoCodigo,
            tipo: 'AJUSTE',
            cantidad,
            usuarioCodigo,
            ubicacion,

            referencia: `AJUSTE_ENTRADA: ${motivo.trim()}${
              referencia ? ` | REF: ${referencia.trim()}` : ''
            }`,
          },
        });

        return {
          mensaje: 'Ajuste de entrada realizado correctamente',

          productoCodigo,
          ubicacion,
          tipoAjuste,
          cantidad,

          motivo: motivo.trim(),
          referencia: referencia ?? null,

          inventario: {
            ubicacion,
            cantidad: inventario.cantidad,
          },

          movimiento: {
            id: movimiento.id,
            tipo: movimiento.tipo,
            cantidad: movimiento.cantidad,
            ubicacion: movimiento.ubicacion,
            referencia: movimiento.referencia,
            usuarioCodigo: movimiento.usuarioCodigo,
            fecha: movimiento.fecha,
          },
        };
      }

      // ==========================================
      // ➖ AJUSTE DE SALIDA
      // ==========================================

      // Debe existir inventario
      if (!inventarioExistente) {
        throw new BadRequestException(
          `No existe inventario del producto ${productoCodigo} en la ubicación ${ubicacion}`,
        );
      }

      // Validar stock suficiente
      if (inventarioExistente.cantidad < cantidad) {
        throw new BadRequestException(
          `Stock insuficiente en ${ubicacion}. Disponible: ${inventarioExistente.cantidad}`,
        );
      }

      const nuevaCantidad = inventarioExistente.cantidad - cantidad;

      let inventarioResultado: {
        ubicacion: string;
        cantidad: number;
      };

      // Si queda en cero, eliminar registro
      if (nuevaCantidad === 0) {
        await tx.inventario.delete({
          where: key,
        });

        inventarioResultado = {
          ubicacion,
          cantidad: 0,
        };
      } else {
        // Disminuir inventario
        const inventario = await tx.inventario.update({
          where: key,
          data: {
            cantidad: nuevaCantidad,
          },
        });

        inventarioResultado = {
          ubicacion,
          cantidad: inventario.cantidad,
        };
      }

      // Crear movimiento
      const movimiento = await tx.movimientosInventario.create({
        data: {
          productoCodigo,
          tipo: 'AJUSTE',
          cantidad,
          usuarioCodigo,
          ubicacion,

          referencia: `AJUSTE_SALIDA: ${motivo.trim()}${
            referencia ? ` | REF: ${referencia.trim()}` : ''
          }`,
        },
      });

      return {
        mensaje: 'Ajuste de salida realizado correctamente',

        productoCodigo,
        ubicacion,
        tipoAjuste,
        cantidad,

        motivo: motivo.trim(),
        referencia: referencia ?? null,

        inventario: inventarioResultado,

        movimiento: {
          id: movimiento.id,
          tipo: movimiento.tipo,
          cantidad: movimiento.cantidad,
          ubicacion: movimiento.ubicacion,
          referencia: movimiento.referencia,
          usuarioCodigo: movimiento.usuarioCodigo,
          fecha: movimiento.fecha,
        },
      };
    });
  }
}

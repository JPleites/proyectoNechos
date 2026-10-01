import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeneradorCodigoService } from '../../common/services/generador-codigo/generador-codigo.service';
import { CrearDevolucionDto } from './dto/crear-devolucion.dto';

@Injectable()
export class DevolucionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGen: GeneradorCodigoService,
  ) {}

  // =========================================================
  // CREAR DEVOLUCIÓN
  // =========================================================

  async crearDevolucion(data: CrearDevolucionDto, usuarioCodigo: number) {
    return this.prisma.$transaction(async (tx) => {
      // =====================================================
      // 1. VALIDAR VENTA
      // =====================================================

      const venta = await tx.ventas.findUnique({
        where: {
          id: data.ventaId,
        },
      });

      if (!venta) {
        throw new NotFoundException('Venta no encontrada');
      }

      // =====================================================
      // 2. VALIDAR QUE LA VENTA ESTÉ FACTURADA
      // =====================================================

      if (venta.estado !== 'FACTURADA') {
        throw new BadRequestException(
          'La devolución solo puede realizarse sobre una venta facturada',
        );
      }

      // =====================================================
      // 3. VALIDAR PRODUCTO EN LA VENTA
      // =====================================================

      const detalle = await tx.ventaDetalle.findFirst({
        where: {
          ventaID: data.ventaId,
          productoCodigo: data.productoCodigo,
        },
      });

      if (!detalle) {
        throw new BadRequestException(
          'El producto no pertenece a la venta indicada',
        );
      }

      // =====================================================
      // 4. OBTENER DEVOLUCIONES ANTERIORES
      // =====================================================

      const devolucionesAnteriores = await tx.devoluciones.aggregate({
        where: {
          ventaId: data.ventaId,
          productoCodigo: data.productoCodigo,
        },
        _sum: {
          cantidad: true,
        },
      });

      const cantidadDevuelta = devolucionesAnteriores._sum.cantidad ?? 0;

      // =====================================================
      // 5. CALCULAR CANTIDAD DISPONIBLE
      // =====================================================

      const cantidadDisponible = detalle.cantidad - cantidadDevuelta;

      if (cantidadDisponible <= 0) {
        throw new BadRequestException(
          'No quedan unidades disponibles para devolver de este producto',
        );
      }

      if (data.cantidad > cantidadDisponible) {
        throw new BadRequestException(
          `La cantidad solicitada excede la cantidad disponible para devolución. ` +
            `Vendidas: ${detalle.cantidad}, ` +
            `Ya devueltas: ${cantidadDevuelta}, ` +
            `Disponibles: ${cantidadDisponible}`,
        );
      }

      // =====================================================
      // 6. GENERAR DEVOLUCION ID
      // =====================================================

      const ultimaDevolucion = await tx.devoluciones.findFirst({
        orderBy: {
          id: 'desc',
        },
      });

      const devolucionID = this.codeGen.generate(
        'DEV',
        ultimaDevolucion ? ultimaDevolucion.id + 1 : 1,
      );

      // =====================================================
      // 7. CREAR DEVOLUCIÓN
      // =====================================================

      const devolucion = await tx.devoluciones.create({
        data: {
          devolucionID,
          ventaId: data.ventaId,
          productoCodigo: data.productoCodigo,
          cantidad: data.cantidad,
          motivo: data.motivo.trim(),
          PrecioUnitario: detalle.precioUnitario,
          usuarioCodigo,
          fueUsada: false,
        },
        include: {
          producto: true,
          venta: {
            include: {
              cliente: true,
            },
          },
          Usuarios: {
            include: {
              perfil: true,
            },
          },
        },
      });

      // =====================================================
      // 8. CALCULAR VALOR DE LA DEVOLUCIÓN
      // =====================================================

      const valorDevolucion =
        Number(devolucion.PrecioUnitario) * devolucion.cantidad;

      // =====================================================
      // 9. RESPUESTA
      // =====================================================

      return {
        id: devolucion.id,
        devolucionID: devolucion.devolucionID,
        ventaId: devolucion.ventaId,
        productoCodigo: devolucion.productoCodigo,
        producto: devolucion.producto.producto,
        cantidad: devolucion.cantidad,
        motivo: devolucion.motivo,
        fecha: devolucion.fecha,
        PrecioUnitario: devolucion.PrecioUnitario,
        valorDevolucion,
        fueUsada: devolucion.fueUsada,
        usuarioCodigo: devolucion.usuarioCodigo,
        usuario: devolucion.Usuarios?.perfil?.nombre ?? 'N/A',
        cliente: devolucion.venta.cliente.nombre,
      };
    });
  }

  // =========================================================
  // LISTAR DEVOLUCIONES
  // =========================================================

  async obtenerDevoluciones() {
    const devoluciones = await this.prisma.devoluciones.findMany({
      orderBy: {
        fecha: 'desc',
      },
      include: {
        producto: true,
        venta: {
          include: {
            cliente: true,
          },
        },
        Usuarios: {
          include: {
            perfil: true,
          },
        },
      },
    });

    return devoluciones.map((devolucion) => ({
      id: devolucion.id,
      devolucionID: devolucion.devolucionID,
      ventaId: devolucion.ventaId,
      ventaID: devolucion.venta.ventaID,
      productoCodigo: devolucion.productoCodigo,
      producto: devolucion.producto.producto,
      cantidad: devolucion.cantidad,
      motivo: devolucion.motivo,
      fecha: devolucion.fecha,
      PrecioUnitario: devolucion.PrecioUnitario,
      valorDevolucion: Number(devolucion.PrecioUnitario) * devolucion.cantidad,
      fueUsada: devolucion.fueUsada,
      usuarioCodigo: devolucion.usuarioCodigo,
      usuario: devolucion.Usuarios?.perfil?.nombre ?? 'N/A',
      cliente: devolucion.venta.cliente.nombre,
    }));
  }

  // =========================================================
  // OBTENER DEVOLUCIÓN POR ID
  // =========================================================

  async obtenerDevolucion(devolucionID: string) {
    const devolucion = await this.prisma.devoluciones.findUnique({
      where: {
        devolucionID,
      },
      include: {
        producto: true,
        venta: {
          include: {
            cliente: true,
            detalles: true,
          },
        },
        Usuarios: {
          include: {
            perfil: true,
          },
        },
      },
    });

    if (!devolucion) {
      throw new NotFoundException('Devolución no encontrada');
    }

    return {
      id: devolucion.id,
      devolucionID: devolucion.devolucionID,
      ventaId: devolucion.ventaId,
      ventaID: devolucion.venta.ventaID,
      productoCodigo: devolucion.productoCodigo,
      producto: devolucion.producto.producto,
      cantidad: devolucion.cantidad,
      motivo: devolucion.motivo,
      fecha: devolucion.fecha,
      PrecioUnitario: devolucion.PrecioUnitario,
      valorDevolucion: Number(devolucion.PrecioUnitario) * devolucion.cantidad,
      fueUsada: devolucion.fueUsada,
      usuarioCodigo: devolucion.usuarioCodigo,
      usuario: devolucion.Usuarios?.perfil?.nombre ?? 'N/A',
      cliente: devolucion.venta.cliente.nombre,
    };
  }

  // =========================================================
  // CONSULTA DE DEVOLUCIONES
  // =========================================================

  async consultarDevoluciones(filtros: {
    devolucionID?: string;
    ventaID?: string;
    cliente?: string;
    producto?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    fueUsada?: string;
  }) {
    const {
      devolucionID,
      ventaID,
      cliente,
      producto,
      fechaDesde,
      fechaHasta,
      fueUsada,
    } = filtros;

    const where: any = {};

    // =====================================================
    // FILTRO POR DEVOLUCIÓN
    // =====================================================

    if (devolucionID?.trim()) {
      where.devolucionID = {
        contains: devolucionID.trim(),
        mode: 'insensitive',
      };
    }

    // =====================================================
    // FILTRO POR VENTA
    // =====================================================

    if (ventaID?.trim()) {
      where.venta = {
        ventaID: {
          contains: ventaID.trim(),
          mode: 'insensitive',
        },
      };
    }

    // =====================================================
    // FILTRO POR CLIENTE
    // =====================================================

    if (cliente?.trim()) {
      where.venta = {
        ...(where.venta ?? {}),
        cliente: {
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
        },
      };
    }

    // =====================================================
    // FILTRO POR PRODUCTO
    // =====================================================

    if (producto?.trim()) {
      where.producto = {
        OR: [
          {
            codigo: {
              contains: producto.trim(),
              mode: 'insensitive',
            },
          },
          {
            producto: {
              contains: producto.trim(),
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    // =====================================================
    // FILTRO POR FECHA
    // =====================================================

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

    // =====================================================
    // FILTRO POR USO
    // =====================================================

    if (fueUsada === 'true') {
      where.fueUsada = true;
    }

    if (fueUsada === 'false') {
      where.fueUsada = false;
    }

    // =====================================================
    // CONSULTA
    // =====================================================

    const devoluciones = await this.prisma.devoluciones.findMany({
      where,

      orderBy: {
        fecha: 'desc',
      },

      include: {
        producto: true,

        venta: {
          include: {
            cliente: true,
          },
        },

        Usuarios: {
          include: {
            perfil: true,
          },
        },
      },
    });

    // =====================================================
    // RESPUESTA
    // =====================================================

    return devoluciones.map((devolucion) => ({
      id: devolucion.id,
      devolucionID: devolucion.devolucionID,

      ventaId: devolucion.ventaId,
      ventaID: devolucion.venta.ventaID,

      productoCodigo: devolucion.productoCodigo,
      producto: devolucion.producto.producto,

      cantidad: devolucion.cantidad,
      motivo: devolucion.motivo,
      fecha: devolucion.fecha,

      PrecioUnitario: devolucion.PrecioUnitario,

      valorDevolucion: Number(devolucion.PrecioUnitario) * devolucion.cantidad,

      fueUsada: devolucion.fueUsada,

      usuarioCodigo: devolucion.usuarioCodigo,

      usuario: devolucion.Usuarios?.perfil?.nombre ?? 'N/A',

      cliente: devolucion.venta.cliente.nombre,
    }));
  }
}

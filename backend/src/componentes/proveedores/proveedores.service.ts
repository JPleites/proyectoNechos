import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { Proveedores, Prisma } from '@prisma/client';
import { GeneradorCodigoService } from '../../common/services/generador-codigo/generador-codigo.service';

@Injectable()
export class ProveedoresService {
  constructor(
    private prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  // =========================
  // GENERAR PROVEEDOR ID
  // =========================
  async generarProveedorID() {
    const ultimo = await this.prisma.proveedores.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    const siguiente = ultimo ? ultimo.id + 1 : 1;

    return this.codeGen.generate('PR', siguiente);
  }

  // =========================
  // OBTENER UNO
  // =========================
  async proveedor(
    where: Prisma.ProveedoresWhereUniqueInput,
  ): Promise<Proveedores | null> {
    return this.prisma.proveedores.findUnique({
      where,
      include: {
        CategoriaProveedores: {
          include: {
            categoria: true,
          },
        },
      },
    });
  }

  // =========================
  // LISTAR TODOS
  // =========================
  async proveedores(): Promise<Proveedores[]> {
    return this.prisma.proveedores.findMany({
      include: {
        CategoriaProveedores: {
          include: {
            categoria: true,
          },
        },
        productos: true,
      },
      orderBy: {
        proveedor: 'asc',
      },
    });
  }

  // =========================
  // CREAR PROVEEDOR
  // =========================
  async create(data: any): Promise<Proveedores> {
    // Validar duplicado por RTN
    const existe = await this.prisma.proveedores.findUnique({
      where: { rtn: data.rtn },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe un proveedor con este RTN',
      );
    }

    // Validar duplicado por nombre
    const existeNombre = await this.prisma.proveedores.findFirst({
      where: {
        proveedor: {
          equals: data.proveedor,
          mode: 'insensitive',
        },
      },
    });

    if (existeNombre) {
      throw new BadRequestException(
        'Ya existe un proveedor con este nombre',
      );
    }

    // Generar código interno
    const proveedorID = await this.generarProveedorID();

    return this.prisma.proveedores.create({
      data: {
        proveedorID,
        rtn: data.rtn,
        proveedor: data.proveedor,
      },
    });
  }

  // =========================
  // ACTUALIZAR
  // =========================
  async update(params: {
    where: Prisma.ProveedoresWhereUniqueInput;
    data: Prisma.ProveedoresUpdateInput;
  }): Promise<Proveedores> {
    const { where, data } = params;

    const proveedor = await this.prisma.proveedores.findUnique({
      where,
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    // Validar RTN duplicado
    if (data.rtn) {
      const existe = await this.prisma.proveedores.findFirst({
        where: {
          rtn: data.rtn as string,
          NOT: {
            id: proveedor.id,
          },
        },
      });

      if (existe) {
        throw new BadRequestException(
          'Ya existe otro proveedor con este RTN',
        );
      }
    }

    // Validar nombre duplicado
    if (data.proveedor) {
      const existeNombre = await this.prisma.proveedores.findFirst({
        where: {
          proveedor: {
            equals: data.proveedor as string,
            mode: 'insensitive',
          },
          NOT: {
            id: proveedor.id,
          },
        },
      });

      if (existeNombre) {
        throw new BadRequestException(
          'Ya existe otro proveedor con este nombre',
        );
      }
    }

    return this.prisma.proveedores.update({
      where,
      data,
    });
  }

  // =========================
  // ELIMINAR
  // =========================
  async delete(where: Prisma.ProveedoresWhereUniqueInput) {
    const proveedor = await this.prisma.proveedores.findUnique({
      where,
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return this.prisma.proveedores.delete({
      where,
    });
  }

  // =========================
  // BUSCAR
  // =========================
  async buscar(query: string) {
    return this.prisma.proveedores.findMany({
      where: {
        OR: [
          {
            proveedor: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            rtn: {
              contains: query,
            },
          },
          {
            proveedorID: {
              contains: query,
            },
          },
        ],
      },
      orderBy: {
        proveedor: 'asc',
      },
    });
  }
}
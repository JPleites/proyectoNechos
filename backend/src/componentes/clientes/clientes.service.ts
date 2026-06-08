import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { Clientes, Prisma } from '@prisma/client';
import { GeneradorCodigoService } from '../../common/services/generador-codigo/generador-codigo.service';

@Injectable()
export class ClientesService {
  constructor(
    private prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  // =========================
  // GENERAR CLIENTE ID
  // =========================
  async generarClienteID() {
    const ultimoCliente = await this.prisma.clientes.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    const siguienteNumero = ultimoCliente
      ? ultimoCliente.id + 1
      : 1;

    return this.codeGen.generate('C', siguienteNumero);
  }

  // =========================
  // OBTENER UN CLIENTE
  // =========================
  async cliente(
    where: Prisma.ClientesWhereUniqueInput,
  ): Promise<Clientes | null> {
    return this.prisma.clientes.findUnique({
      where,
    });
  }

  // =========================
  // LISTAR CLIENTES
  // =========================
  async clientes(params?: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ClientesWhereUniqueInput;
    where?: Prisma.ClientesWhereInput;
    orderBy?: Prisma.ClientesOrderByWithRelationInput;
  }): Promise<Clientes[]> {
    return this.prisma.clientes.findMany({
      ...params,
      orderBy: params?.orderBy || {
        id: 'desc',
      },
    });
  }

  // =========================
  // CREAR CLIENTE
  // =========================
  async createClientes(
    data: Prisma.ClientesCreateInput,
  ): Promise<Clientes> {
    // Validar RTN duplicado
    const existeRTN = await this.prisma.clientes.findUnique({
      where: {
        rtn: data.rtn,
      },
    });

    if (existeRTN) {
      throw new BadRequestException(
        'Ya existe un cliente con este RTN',
      );
    }

    // Generar código interno
    const clienteID = await this.generarClienteID();

    return this.prisma.clientes.create({
      data: {
        ...data,
        clienteID,
      },
    });
  }

  // =========================
  // ACTUALIZAR CLIENTE
  // =========================
  async updateClientes(params: {
    where: Prisma.ClientesWhereUniqueInput;
    data: Prisma.ClientesUpdateInput;
  }): Promise<Clientes> {
    const { where, data } = params;

    // Verificar existencia
    const cliente = await this.prisma.clientes.findUnique({
      where,
    });

    if (!cliente) {
      throw new NotFoundException(
        'Cliente no encontrado',
      );
    }

    // Validar RTN duplicado
    if (data.rtn) {
      const rtnExiste = await this.prisma.clientes.findFirst({
        where: {
          rtn: data.rtn as string,
          NOT: {
            id: cliente.id,
          },
        },
      });

      if (rtnExiste) {
        throw new BadRequestException(
          'Ya existe otro cliente con este RTN',
        );
      }
    }

    return this.prisma.clientes.update({
      where,
      data,
    });
  }

  // =========================
  // ELIMINAR CLIENTE
  // =========================
  async deleteClientes(
    where: Prisma.ClientesWhereUniqueInput,
  ): Promise<Clientes> {
    // Verificar existencia
    const cliente = await this.prisma.clientes.findUnique({
      where,
    });

    if (!cliente) {
      throw new NotFoundException(
        'Cliente no encontrado',
      );
    }

    return this.prisma.clientes.delete({
      where,
    });
  }

  // =========================
  // BUSCAR CLIENTES
  // =========================
  async buscarClientes(query: string) {
    return this.prisma.clientes.findMany({
      where: {
        OR: [
          {
            nombre: {
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
            clienteID: {
              contains: query,
            },
          },
        ],
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }
}
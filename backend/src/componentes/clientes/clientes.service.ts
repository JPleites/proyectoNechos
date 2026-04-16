import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Clientes, Prisma } from "@prisma/client";

@Injectable()
export class ClientesService {
    constructor(private prisma: PrismaService) {}

    async cliente(
        clienteWhereUniqueInput: Prisma.ClientesWhereUniqueInput,
    ): Promise<Clientes | null> {
        return this.prisma.clientes.findUnique({
            where: clienteWhereUniqueInput,
        });
    }

    async clientes(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.ClientesWhereUniqueInput;
        where?: Prisma.ClientesWhereInput;
        orderBy?: Prisma.ClientesOrderByWithRelationInput;
    }): Promise<Clientes[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.clientes.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createClientes(data: Prisma.ClientesCreateInput): Promise<Clientes> {
        return this.prisma.clientes.create({
            data,
        });
    }

    async updateClientes(params: {
        where: Prisma.ClientesWhereUniqueInput;
        data: Prisma.ClientesUpdateInput;
    }): Promise<Clientes> {
        const { where, data } = params;
        return this.prisma.clientes.update({
            data,
            where,
        });
    }

    async deleteClientes(where: Prisma.ClientesWhereUniqueInput): Promise<Clientes> {
        return this.prisma.clientes.delete({
            where,
        });
    }
}
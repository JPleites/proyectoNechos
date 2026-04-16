import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Perfil, Prisma } from '@prisma/client';

@Injectable()

export class PerfilService {
    constructor(private prisma: PrismaService) {}

    async perfil(
        perfilWhereUniqueInput: Prisma.PerfilWhereUniqueInput,
    ): Promise<Perfil | null> {
        return this.prisma.perfil.findUnique({
            where: perfilWhereUniqueInput,
        });
    }

    async perfils(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.PerfilWhereUniqueInput;
        where?: Prisma.PerfilWhereInput;
        orderBy?: Prisma.PerfilOrderByWithRelationInput;
    }): Promise<Perfil[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.perfil.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createPerfil(data: Prisma.PerfilCreateInput): Promise<Perfil> {
        return this.prisma.perfil.create({
            data,
        });
    }

    async updatePerfil(params: {
        where: Prisma.PerfilWhereUniqueInput;
        data: Prisma.PerfilUpdateInput;
    }): Promise<Perfil> {
        const { where, data } = params;
        return this.prisma.perfil.update({
            data,
            where,
        });
    }

    async deletePerfil(
        where: Prisma.PerfilWhereUniqueInput,
    ): Promise<Perfil> {
        return this.prisma.perfil.delete({
            where,
        });
    }
}
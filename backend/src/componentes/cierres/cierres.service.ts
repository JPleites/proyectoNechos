import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cierres, Prisma } from '@prisma/client';

@Injectable()

export class CierresService {
    constructor(private prisma: PrismaService) {}

    async cierre(
        cierreWhereUniqueInput: Prisma.CierresWhereUniqueInput,
    ): Promise<Cierres | null> {
        return this.prisma.cierres.findUnique({
            where: cierreWhereUniqueInput,
        });
    }

    async cierres(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.CierresWhereUniqueInput;
        where?: Prisma.CierresWhereInput;
        orderBy?: Prisma.CierresOrderByWithRelationInput;
    }): Promise<Cierres[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.cierres.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createCierres(data: Prisma.CierresCreateInput): Promise<Cierres> {
        return this.prisma.cierres.create({
            data,
        });
    }

    async updateCierres(params: {
        where: Prisma.CierresWhereUniqueInput;
        data: Prisma.CierresUpdateInput;
    }): Promise<Cierres> {
        const { where, data } = params;
        return this.prisma.cierres.update({
            data,
            where,
        });
    }

    async deleteCierres(
        where: Prisma.CierresWhereUniqueInput,
    ): Promise<Cierres> {
        return this.prisma.cierres.delete({
            where,
        });
    }
}
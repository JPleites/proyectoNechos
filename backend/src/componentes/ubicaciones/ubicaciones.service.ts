import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Ubicaciones, Prisma } from '@prisma/client';

@Injectable()

export class UbicacionesService {
    constructor(private prisma: PrismaService) {}

    async ubicacion(
        ubicacionWhereUniqueInput: Prisma.UbicacionesWhereUniqueInput,
    ): Promise<Ubicaciones | null> {
        return this.prisma.ubicaciones.findUnique({
            where: ubicacionWhereUniqueInput,
        });
    }

    async ubicaciones(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UbicacionesWhereUniqueInput;
        where?: Prisma.UbicacionesWhereInput;
        orderBy?: Prisma.UbicacionesOrderByWithRelationInput;
    }): Promise<Ubicaciones[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.ubicaciones.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createUbicaciones(data: Prisma.UbicacionesCreateInput): Promise<Ubicaciones> {
        return this.prisma.ubicaciones.create({
            data,
        });
    }

    async updateUbicaciones(params: {
        where: Prisma.UbicacionesWhereUniqueInput;
        data: Prisma.UbicacionesUpdateInput;
    }): Promise<Ubicaciones> {
        const { where, data } = params;
        return this.prisma.ubicaciones.update({
            data,
            where,
        });
    }

    async deleteUbicaciones(
        where: Prisma.UbicacionesWhereUniqueInput,
    ): Promise<Ubicaciones> {
        return this.prisma.ubicaciones.delete({
            where,
        });
    }
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Usuarios, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async usuario(
    usuarioWhereUniqueInput: Prisma.UsuariosWhereUniqueInput,
  ): Promise<Usuarios | null> {
    return this.prisma.usuarios.findUnique({
      where: usuarioWhereUniqueInput,
    });
  }

  async usuarios(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UsuariosWhereUniqueInput;
    where?: Prisma.UsuariosWhereInput;
    orderBy?: Prisma.UsuariosOrderByWithRelationInput;
  }): Promise<Usuarios[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.usuarios.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUsuarios(data: Prisma.UsuariosCreateInput): Promise<Usuarios> {
    const hashedPassword = await bcrypt.hash(data.contrasena, 10);
    return this.prisma.usuarios.create({
      data: {
        ...data,
        contrasena: hashedPassword,
      },
    });
  }

  async updateUsuarios(params: {
    where: Prisma.UsuariosWhereUniqueInput;
    data: Prisma.UsuariosUpdateInput;
  }): Promise<Usuarios> {
    const { where, data } = params;
    return this.prisma.usuarios.update({
      data,
      where,
    });
  }

  async deleteUsuarios(
    where: Prisma.UsuariosWhereUniqueInput,
  ): Promise<Usuarios> {
    return this.prisma.usuarios.delete({
      where,
    });
  }
}

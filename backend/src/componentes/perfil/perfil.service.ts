import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Perfil, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  async perfiles(params: {
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

//   async createPerfil(data: Prisma.PerfilCreateInput): Promise<Perfil> {
//     return this.prisma.perfil.create({
//       data,
//     });
//   }

  async createPerfil(data: any) {
    // 1. Crear perfil
    const perfil = await this.prisma.perfil.create({
      data: {
        dni: data.dni,
        nombre: data.nombre,
        telefono: data.telefono,
        cargo: data.cargo,
        departamento: data.departamento,
        direccion: data.direccion,
        fechaIngreso: new Date(data.fechaIngreso),
        fechaUltimoAscenso: new Date(data.fechaUltimoAscenso),
      },
    });

    // 2. Si quiere usuario
    if (data.crearUsuario) {
      const hashedPassword = await bcrypt.hash(data.contrasena, 10);

      await this.prisma.usuarios.create({
        data: {
          contrasena: hashedPassword,
          rol: data.rol,
          perfilId: perfil.id,
        },
      });
    }

    return {
      mensaje: 'Perfil creado correctamente',
      perfil,
    };
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

  async deletePerfil(where: Prisma.PerfilWhereUniqueInput): Promise<Perfil> {
    return this.prisma.perfil.delete({
      where,
    });
  }
}

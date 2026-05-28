import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(codigo: number, contrasena: string) {
    const user = await this.prisma.usuarios.findUnique({
      where: { codigo },
      include:{
        perfil: true
      }
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no existe');
    }

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!isMatch) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const token = jwt.sign(
      { sub: user.codigo, rol: user.rol, nombre: user.perfil.nombre },
      process.env.JWT_SECRET! ,
      { expiresIn: '8h' },
    );

    return {
      access_token: token,
      rol: user.rol,
      codigo: user.codigo,
      nombre: user.perfil.nombre,
    };
  }
}

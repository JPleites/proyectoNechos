import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Ventas } from '@prisma/client';

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}
}

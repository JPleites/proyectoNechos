import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { GeneradorCodigoService } from '../../common/services/generador-codigo/generador-codigo.service';

@Injectable()
export class MarcaService {
  constructor(
    private prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  async generarMarcaID() {
    const ultimoMarca = await this.prisma.marca.findFirst({
      orderBy: {
        id: 'desc',
      },
    });

    const siguienteNumero = ultimoMarca ? ultimoMarca.id + 1 : 1;

    return this.codeGen.generate('M', siguienteNumero);
  }

  async create(data: CreateMarcaDto) {
    // 🔥 validar proveedor
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id: Number(data.proveedorId) },
    });

    if (!proveedor) {
      throw new BadRequestException('Proveedor no existe');
    }

    // 🔥 evitar duplicados por proveedor
    const existe = await this.prisma.marca.findFirst({
      where: {
        nombre: data.nombre,
        proveedorId: Number(data.proveedorId),
      },
    });

    if (existe) {
      throw new BadRequestException('Esta marca ya existe para este proveedor');
    }

    // 🔥 generar ID tipo M1
    const marcaID = await this.generarMarcaID();

    return this.prisma.marca.create({
      data: {
        marcaID,
        nombre: data.nombre,
        proveedorRel: {
          connect: { id: Number(data.proveedorId) },
        },
      },
    });
  }

  async findByProveedor(proveedorId: number) {
    return this.prisma.marca.findMany({
      where: { proveedorId },
    });
  }

  async findAll() {
    return this.prisma.marca.findMany({
      include: {
        proveedorRel: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.marca.findUnique({
      where: { id },
      include: { proveedorRel: true },
    });
  }

  async update(id: number, data: CreateMarcaDto) {
    return this.prisma.marca.update({
      where: { id },
      data: {
        nombre: data.nombre,
        proveedorId: Number(data.proveedorId),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.marca.delete({
      where: { id },
    });
  }
}

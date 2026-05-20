import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriaProveedoresService {
  constructor(private prisma: PrismaService) {}

  // 🔍 Obtener relaciones
  async getByProveedor(rtn: string) {
    return this.prisma.categoriaProveedores.findMany({
      where: { proveedorRtn: rtn },
    });
  }

  // 💾 Reemplazar categorías del proveedor
  async asignarCategorias(rtn: string, categorias: string[]) {
    // 1️⃣ eliminar relaciones actuales
    await this.prisma.categoriaProveedores.deleteMany({
      where: { proveedorRtn: rtn },
    });

    // 2️⃣ crear nuevas
    const data = categorias.map((categoriaId) => ({
      proveedorRtn: rtn,
      categoriaId,
    }));

    return this.prisma.categoriaProveedores.createMany({
      data,
    });
  }
}
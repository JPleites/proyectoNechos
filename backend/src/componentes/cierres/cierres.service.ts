import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Cierres, Prisma } from '@prisma/client';

@Injectable()
export class CierresService {
  constructor(private prisma: PrismaService) {}

  async cerrarCaja(data: any) {
    const {
      usuarioCodigo,
      efectivoContado,
      bacContado,
      ficohsaContado,
      daviviendaContado,
      transferenciaContado,
      totalRecibido,
    } = data;

    return this.prisma.$transaction(async (tx) => {
      // 1. Obtener arqueo del día
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const arqueo = await tx.arqueo.findFirst({
        where: {
          usuarioCodigo,
          fecha: {
            gte: hoy,
          },
        },
        orderBy: {
          fecha: 'desc',
        },
      });

      if (!arqueo) {
        throw new BadRequestException('No hay arqueo del día');
      }

      // 2. Calcular diferencias
      const difEfectivo =
        Number(efectivoContado) - Number(arqueo.totalEfectivo);

      const difBac = Number(bacContado) - Number(arqueo.totalBac);

      const difFicohsa = Number(ficohsaContado) - Number(arqueo.totalFicohsa);

      const difDavivienda =
        Number(daviviendaContado) - Number(arqueo.totalDavivienda);

      const difTransferencia =
        Number(transferenciaContado) - Number(arqueo.totalTransferencias);

      const diferenciaTotal =
        difEfectivo + difBac + difFicohsa + difDavivienda + difTransferencia;

      // 3. Crear cierre
      const cierre = await tx.cierres.create({
        data: {
          usuarioCodigo,

          totalEfectivo: efectivoContado,
          totalBac: bacContado,
          totalFicohsa: ficohsaContado,
          totalDavivienda: daviviendaContado,
          totalTransferencias: transferenciaContado,

          totalRecibido: totalRecibido,
          diferencia: diferenciaTotal,

          totalRetiros: 0,
          totalDevoluciones: 0,
          totalFacturado:
            Number(arqueo.totalEfectivo) +
            Number(arqueo.totalBac) +
            Number(arqueo.totalFicohsa) +
            Number(arqueo.totalDavivienda) +
            Number(arqueo.totalTransferencias),
        },
      });

      // 4. Opcional: reset arqueo del día (o lo dejas histórico)
      await tx.arqueo.update({
        where: { id: arqueo.id },
        data: {
          totalEfectivo: 0,
          totalBac: 0,
          totalFicohsa: 0,
          totalDavivienda: 0,
          totalTransferencias: 0,
        },
      });

      return cierre;
    });
  }

  async generarPdfCierre(id: number): Promise<Buffer> {
    const cierre = await this.prisma.cierres.findUnique({
      where: { id },
      include: {
        usuario: {
          include: {
            perfil: true,
          },
        },
      },
    });

    if (!cierre) {
      throw new Error('Cierre no encontrado');
    }

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // ================= HEADER =================
      doc.fontSize(18).text('CIERRE DE CAJA', { align: 'center' }).moveDown();

      doc
        .fontSize(10)
        .text(`Usuario: ${cierre.usuario.perfil.nombre}`)
        .text(`Código: ${cierre.usuarioCodigo}`)
        .text(`Fecha: ${new Date().toLocaleString()}`)
        .moveDown();

      // ================= TABLA =================
      doc.fontSize(12).text('RESUMEN DE INGRESOS', { underline: true });
      doc.moveDown(0.5);

      const rows = [
        ['Efectivo', cierre.totalEfectivo],
        ['BAC', cierre.totalBac],
        ['Ficohsa', cierre.totalFicohsa],
        ['Davivienda', cierre.totalDavivienda],
        ['Transferencias', cierre.totalTransferencias],
      ];

      rows.forEach(([label, value]) => {
        doc.text(`${label}: L ${Number(value).toFixed(2)}`);
      });

      doc.moveDown();

      // ================= TOTALES =================
      const totalSistema =
        Number(cierre.totalEfectivo) +
        Number(cierre.totalBac) +
        Number(cierre.totalFicohsa) +
        Number(cierre.totalDavivienda) +
        Number(cierre.totalTransferencias);

      doc
        .fontSize(12)
        .text(`TOTAL SISTEMA: L ${totalSistema.toFixed(2)}`)
        .text(`TOTAL CONTADO: L ${cierre.totalRecibido}`)
        .moveDown();

      // ================= DIFERENCIA =================
      const color = cierre.diferencia.toNumber() >= 0 ? 'green' : 'red';

      doc
        .fillColor(color)
        .fontSize(14)
        .text(`DIFERENCIA: L ${cierre.diferencia.toFixed(2)}`)
        .fillColor('black');

      doc.moveDown(2);

      // ================= FIRMA =================
      doc.text('_________________________', { align: 'right' });
      doc.text('Firma Cajero', { align: 'right' });

      doc.end();
    });
  }

  // async cierre(
  //     cierreWhereUniqueInput: Prisma.CierresWhereUniqueInput,
  // ): Promise<Cierres | null> {
  //     return this.prisma.cierres.findUnique({
  //         where: cierreWhereUniqueInput,
  //     });
  // }

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

  // async createCierres(data: Prisma.CierresCreateInput): Promise<Cierres> {
  //     return this.prisma.cierres.create({
  //         data,
  //     });
  // }

  // async updateCierres(params: {
  //     where: Prisma.CierresWhereUniqueInput;
  //     data: Prisma.CierresUpdateInput;
  // }): Promise<Cierres> {
  //     const { where, data } = params;
  //     return this.prisma.cierres.update({
  //         data,
  //         where,
  //     });
  // }

  // async deleteCierres(
  //     where: Prisma.CierresWhereUniqueInput,
  // ): Promise<Cierres> {
  //     return this.prisma.cierres.delete({
  //         where,
  //     });
  // }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { GeneradorCodigoService } from 'src/common/services/generador-codigo/generador-codigo.service';

@Injectable()
export class CierresService {
  constructor(
    private prisma: PrismaService,
    private codeGen: GeneradorCodigoService,
  ) {}

  // =========================
  // CERRAR CAJA
  // =========================
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
          fecha: { gte: hoy },
        },
        orderBy: { fecha: 'desc' },
      });

      if (!arqueo) {
        throw new BadRequestException('No hay arqueo del día');
      }

      // 2. Cálculo de diferencias
      const difEfectivo = Number(efectivoContado) - Number(arqueo.totalEfectivo);
      const difBac = Number(bacContado) - Number(arqueo.totalBac);
      const difFicohsa = Number(ficohsaContado) - Number(arqueo.totalFicohsa);
      const difDavivienda = Number(daviviendaContado) - Number(arqueo.totalDavivienda);
      const difTransferencia = Number(transferenciaContado) - Number(arqueo.totalTransferencias);

      const diferenciaTotal =
        difEfectivo +
        difBac +
        difFicohsa +
        difDavivienda +
        difTransferencia;

      const totalSistema =
        Number(arqueo.totalEfectivo) +
        Number(arqueo.totalBac) +
        Number(arqueo.totalFicohsa) +
        Number(arqueo.totalDavivienda) +
        Number(arqueo.totalTransferencias);

      // 3. Generar código interno
      const cierreID = await this.codeGen.generate(
        'C',
        await this.getNextId(),
      );

      // 4. Crear cierre
      const cierre = await tx.cierres.create({
        data: {
          cierreID,
          usuarioCodigo,

          totalEfectivo: efectivoContado,
          totalBac: bacContado,
          totalFicohsa: ficohsaContado,
          totalDavivienda: daviviendaContado,
          totalTransferencias: transferenciaContado,

          totalRecibido,
          diferencia: diferenciaTotal,

          totalRetiros: 0,
          totalDevoluciones: 0,
          totalFacturado: totalSistema,
        },
      });

      // 5. Reset arqueo
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

  // =========================
  // GENERAR SIGUIENTE ID
  // =========================
  private async getNextId() {
    const last = await this.prisma.cierres.findFirst({
      orderBy: { id: 'desc' },
    });

    return last ? last.id + 1 : 1;
  }

  // =========================
  // PDF
  // =========================
  async generarPdfCierre(id: number): Promise<Buffer> {
    const cierre = await this.prisma.cierres.findUnique({
      where: { id },
      include: {
        usuario: { include: { perfil: true } },
      },
    });

    if (!cierre) {
      throw new BadRequestException('Cierre no encontrado');
    }

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const num = (v: any) => Number(v || 0);

      doc.fontSize(18).text('CIERRE DE CAJA', { align: 'center' }).moveDown();

      doc
        .fontSize(10)
        .text(`Usuario: ${cierre.usuario.perfil.nombre}`)
        .text(`Código: ${cierre.usuarioCodigo}`)
        .text(`Cierre ID: ${cierre.cierreID}`)
        .moveDown();

      const rows = [
        ['Efectivo', cierre.totalEfectivo],
        ['BAC', cierre.totalBac],
        ['Ficohsa', cierre.totalFicohsa],
        ['Davivienda', cierre.totalDavivienda],
        ['Transferencias', cierre.totalTransferencias],
      ];

      rows.forEach(([label, value]) => {
        doc.text(`${label}: L ${num(value).toFixed(2)}`);
      });

      const totalSistema =
        num(cierre.totalEfectivo) +
        num(cierre.totalBac) +
        num(cierre.totalFicohsa) +
        num(cierre.totalDavivienda) +
        num(cierre.totalTransferencias);

      doc
        .moveDown()
        .text(`TOTAL SISTEMA: L ${totalSistema.toFixed(2)}`)
        .text(`TOTAL CONTADO: L ${num(cierre.totalRecibido).toFixed(2)}`)
        .moveDown();

      const diff = num(cierre.diferencia);

      doc
        .fillColor(diff >= 0 ? 'green' : 'red')
        .fontSize(14)
        .text(`DIFERENCIA: L ${diff.toFixed(2)}`)
        .fillColor('black');

      doc.end();
    });
  }

  // =========================
  // LISTAR
  // =========================
  async cierres(params: any) {
    return this.prisma.cierres.findMany({
      ...params,
      orderBy: { fecha: 'desc' },
      include: {
        usuario: true,
      },
    });
  }
}
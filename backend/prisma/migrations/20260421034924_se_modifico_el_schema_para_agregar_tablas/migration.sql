/*
  Warnings:

  - You are about to drop the column `TotalEfectivo` on the `Arqueo` table. All the data in the column will be lost.
  - You are about to alter the column `totalBac` on the `Arqueo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalFicohsa` on the `Arqueo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalDavivienda` on the `Arqueo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalTransferencias` on the `Arqueo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalRetiros` on the `Arqueo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalDevoluciones` on the `Arqueo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `TotalEfectivo` on the `Cierres` table. All the data in the column will be lost.
  - You are about to alter the column `totalBac` on the `Cierres` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalFicohsa` on the `Cierres` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalDavivienda` on the `Cierres` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalTransferencias` on the `Cierres` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalRetiros` on the `Cierres` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalDevoluciones` on the `Cierres` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalFacturado` on the `Cierres` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalRecibido` on the `Cierres` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `diferencia` on the `Cierres` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `costo` on the `Productos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `precio` on the `Productos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `descuento` on the `Productos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - Added the required column `totalEfectivo` to the `Arqueo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalEfectivo` to the `Cierres` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Arqueo" DROP COLUMN "TotalEfectivo",
ADD COLUMN     "totalEfectivo" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "totalBac" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalFicohsa" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalDavivienda" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalTransferencias" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalRetiros" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalDevoluciones" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Cierres" DROP COLUMN "TotalEfectivo",
ADD COLUMN     "totalEfectivo" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "totalBac" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalFicohsa" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalDavivienda" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalTransferencias" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalRetiros" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalDevoluciones" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalFacturado" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalRecibido" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "diferencia" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Productos" ALTER COLUMN "costo" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "precio" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "descuento" SET DATA TYPE DECIMAL(65,30);

-- CreateTable
CREATE TABLE "Ventas" (
    "id" SERIAL NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaDetalle" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoCodigo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "VentaDetalle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Arqueo" ADD CONSTRAINT "Arqueo_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cierres" ADD CONSTRAINT "Cierres_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ventas" ADD CONSTRAINT "Ventas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDetalle" ADD CONSTRAINT "VentaDetalle_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDetalle" ADD CONSTRAINT "VentaDetalle_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

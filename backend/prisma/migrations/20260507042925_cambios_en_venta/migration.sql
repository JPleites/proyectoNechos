/*
  Warnings:

  - A unique constraint covering the columns `[numeroRecibo]` on the table `Ventas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `descuento` to the `VentaDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreProducto` to the `VentaDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cambio` to the `Ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descuento` to the `Ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `impuesto` to the `Ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metodoPago` to the `Ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroRecibo` to the `Ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoVenta` to the `Ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalRecibido` to the `Ventas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioCodigo` to the `Ventas` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Clientes_correo_key";

-- DropIndex
DROP INDEX "Clientes_telefono_key";

-- AlterTable
ALTER TABLE "Arqueo" ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Cierres" ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Clientes" ALTER COLUMN "correo" DROP NOT NULL,
ALTER COLUMN "telefono" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VentaDetalle" ADD COLUMN     "descuento" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "nombreProducto" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Ventas" ADD COLUMN     "cambio" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "descuento" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "impuesto" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "metodoPago" TEXT NOT NULL,
ADD COLUMN     "numeroRecibo" TEXT NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "tipoVenta" TEXT NOT NULL,
ADD COLUMN     "total" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "totalRecibido" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "usuarioCodigo" INTEGER NOT NULL,
ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Devoluciones" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoCodigo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devoluciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ventas_numeroRecibo_key" ON "Ventas"("numeroRecibo");

-- AddForeignKey
ALTER TABLE "Devoluciones" ADD CONSTRAINT "Devoluciones_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devoluciones" ADD CONSTRAINT "Devoluciones_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ventas" ADD CONSTRAINT "Ventas_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

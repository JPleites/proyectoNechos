/*
  Warnings:

  - The primary key for the `CategoriaProveedores` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CategoriaProveedores" DROP CONSTRAINT "CategoriaProveedores_proveedorRtn_fkey";

-- AlterTable
ALTER TABLE "Arqueo" ALTER COLUMN "totalEfectivo" SET DEFAULT 0,
ALTER COLUMN "totalBac" SET DEFAULT 0,
ALTER COLUMN "totalFicohsa" SET DEFAULT 0,
ALTER COLUMN "totalDavivienda" SET DEFAULT 0,
ALTER COLUMN "totalTransferencias" SET DEFAULT 0,
ALTER COLUMN "totalRetiros" SET DEFAULT 0,
ALTER COLUMN "totalDevoluciones" SET DEFAULT 0,
ALTER COLUMN "totalFacturado" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "CategoriaProveedores" DROP CONSTRAINT "CategoriaProveedores_pkey",
ALTER COLUMN "proveedorRtn" SET DATA TYPE TEXT,
ADD CONSTRAINT "CategoriaProveedores_pkey" PRIMARY KEY ("categoriaId", "proveedorRtn");

-- AddForeignKey
ALTER TABLE "CategoriaProveedores" ADD CONSTRAINT "CategoriaProveedores_proveedorRtn_fkey" FOREIGN KEY ("proveedorRtn") REFERENCES "Proveedores"("rtn") ON DELETE RESTRICT ON UPDATE CASCADE;

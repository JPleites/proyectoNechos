/*
  Warnings:

  - A unique constraint covering the columns `[codigoProveedor]` on the table `Productos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigoProducto]` on the table `Productos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigoProducto` to the `Productos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigoProveedor` to the `Productos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clientes" ADD COLUMN     "barrio" TEXT,
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "municipio" TEXT,
ALTER COLUMN "direccion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Perfil" ADD COLUMN     "dir_barrio" TEXT,
ADD COLUMN     "dir_departamento" TEXT DEFAULT '',
ADD COLUMN     "dir_municipio" TEXT;

-- AlterTable
ALTER TABLE "Productos" ADD COLUMN     "codigoProducto" TEXT NOT NULL,
ADD COLUMN     "codigoProveedor" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Productos_codigoProveedor_key" ON "Productos"("codigoProveedor");

-- CreateIndex
CREATE UNIQUE INDEX "Productos_codigoProducto_key" ON "Productos"("codigoProducto");

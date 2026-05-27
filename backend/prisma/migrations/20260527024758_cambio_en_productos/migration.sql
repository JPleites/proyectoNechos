/*
  Warnings:

  - You are about to drop the column `categoria` on the `Productos` table. All the data in the column will be lost.
  - You are about to drop the column `proveedor` on the `Productos` table. All the data in the column will be lost.
  - Added the required column `categoriaId` to the `Productos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proveedorId` to the `Productos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Productos" DROP CONSTRAINT "Productos_proveedor_fkey";

-- AlterTable
ALTER TABLE "Productos" DROP COLUMN "categoria",
DROP COLUMN "proveedor",
ADD COLUMN     "categoriaId" INTEGER NOT NULL,
ADD COLUMN     "proveedorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Productos" ADD CONSTRAINT "Productos_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productos" ADD CONSTRAINT "Productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

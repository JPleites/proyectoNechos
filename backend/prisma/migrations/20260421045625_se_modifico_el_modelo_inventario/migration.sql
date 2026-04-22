/*
  Warnings:

  - You are about to drop the column `tipoMovimiento` on the `Inventario` table. All the data in the column will be lost.
  - You are about to drop the column `ultimoMovimiento` on the `Inventario` table. All the data in the column will be lost.
  - You are about to drop the column `ultimoUsuario` on the `Inventario` table. All the data in the column will be lost.
  - Added the required column `cantidad` to the `Inventario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inventario" DROP COLUMN "tipoMovimiento",
DROP COLUMN "ultimoMovimiento",
DROP COLUMN "ultimoUsuario",
ADD COLUMN     "cantidad" INTEGER NOT NULL;

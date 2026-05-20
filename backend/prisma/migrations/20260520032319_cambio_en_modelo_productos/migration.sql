/*
  Warnings:

  - You are about to drop the column `costo` on the `Productos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Productos" DROP COLUMN "costo",
ADD COLUMN     "costoCompra" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "costoVenta" DECIMAL(65,30) NOT NULL DEFAULT 0;

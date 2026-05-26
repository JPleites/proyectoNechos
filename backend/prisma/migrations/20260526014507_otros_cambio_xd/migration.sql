/*
  Warnings:

  - The primary key for the `CategoriaProveedores` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `proveedorRtn` on the `CategoriaProveedores` table. All the data in the column will be lost.
  - Added the required column `proveedorId` to the `CategoriaProveedores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CategoriaProveedores" DROP CONSTRAINT "CategoriaProveedores_proveedorRtn_fkey";

-- AlterTable
ALTER TABLE "CategoriaProveedores" DROP CONSTRAINT "CategoriaProveedores_pkey",
DROP COLUMN "proveedorRtn",
ADD COLUMN     "proveedorId" INTEGER NOT NULL,
ADD CONSTRAINT "CategoriaProveedores_pkey" PRIMARY KEY ("categoriaId", "proveedorId");

-- AddForeignKey
ALTER TABLE "CategoriaProveedores" ADD CONSTRAINT "CategoriaProveedores_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

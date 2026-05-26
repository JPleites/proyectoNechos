/*
  Warnings:

  - The primary key for the `CategoriaProveedores` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `proveedorRtn` on the `CategoriaProveedores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "CategoriaProveedores" DROP CONSTRAINT "CategoriaProveedores_proveedorRtn_fkey";

-- AlterTable
ALTER TABLE "CategoriaProveedores" DROP CONSTRAINT "CategoriaProveedores_pkey",
DROP COLUMN "proveedorRtn",
ADD COLUMN     "proveedorRtn" INTEGER NOT NULL,
ADD CONSTRAINT "CategoriaProveedores_pkey" PRIMARY KEY ("categoriaId", "proveedorRtn");

-- AddForeignKey
ALTER TABLE "CategoriaProveedores" ADD CONSTRAINT "CategoriaProveedores_proveedorRtn_fkey" FOREIGN KEY ("proveedorRtn") REFERENCES "Proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

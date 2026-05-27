/*
  Warnings:

  - You are about to drop the column `marca` on the `Productos` table. All the data in the column will be lost.
  - Added the required column `marcaId` to the `Productos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Productos" DROP COLUMN "marca",
ADD COLUMN     "marcaId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Marca" (
    "id" SERIAL NOT NULL,
    "marcaID" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "proveedorId" INTEGER NOT NULL,

    CONSTRAINT "Marca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Marca_marcaID_key" ON "Marca"("marcaID");

-- AddForeignKey
ALTER TABLE "Marca" ADD CONSTRAINT "Marca_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productos" ADD CONSTRAINT "Productos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

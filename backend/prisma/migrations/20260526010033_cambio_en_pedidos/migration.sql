/*
  Warnings:

  - Made the column `clienteID` on table `Pedidos` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `proveedor` on the `Productos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Pedidos" DROP CONSTRAINT "Pedidos_clienteID_fkey";

-- DropForeignKey
ALTER TABLE "Productos" DROP CONSTRAINT "Productos_proveedor_fkey";

-- AlterTable
ALTER TABLE "Pedidos" ALTER COLUMN "clienteID" SET NOT NULL;

-- AlterTable
ALTER TABLE "Productos" DROP COLUMN "proveedor",
ADD COLUMN     "proveedor" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Pedidos" ADD CONSTRAINT "Pedidos_clienteID_fkey" FOREIGN KEY ("clienteID") REFERENCES "Clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productos" ADD CONSTRAINT "Productos_proveedor_fkey" FOREIGN KEY ("proveedor") REFERENCES "Proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

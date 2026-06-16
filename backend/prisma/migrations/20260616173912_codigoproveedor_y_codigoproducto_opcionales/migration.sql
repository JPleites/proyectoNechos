-- DropIndex
DROP INDEX "Productos_codigoProducto_key";

-- DropIndex
DROP INDEX "Productos_codigoProveedor_key";

-- AlterTable
ALTER TABLE "Productos" ALTER COLUMN "codigoProducto" DROP NOT NULL,
ALTER COLUMN "codigoProveedor" DROP NOT NULL;

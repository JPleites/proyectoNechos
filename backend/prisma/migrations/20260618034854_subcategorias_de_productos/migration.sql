-- AlterTable
ALTER TABLE "Productos" ADD COLUMN     "subCategoriaId" INTEGER,
ALTER COLUMN "codigo" DROP NOT NULL;

-- CreateTable
CREATE TABLE "subCategoria" (
    "id" SERIAL NOT NULL,
    "subCategoriaID" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "subCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subCategoria_subCategoriaID_key" ON "subCategoria"("subCategoriaID");

-- AddForeignKey
ALTER TABLE "subCategoria" ADD CONSTRAINT "subCategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productos" ADD CONSTRAINT "Productos_subCategoriaId_fkey" FOREIGN KEY ("subCategoriaId") REFERENCES "subCategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

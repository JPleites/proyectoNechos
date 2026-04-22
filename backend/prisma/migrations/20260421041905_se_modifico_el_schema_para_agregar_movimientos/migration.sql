-- CreateTable
CREATE TABLE "MovimientosInventario" (
    "id" SERIAL NOT NULL,
    "productoCodigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT,
    "usuarioCodigo" INTEGER NOT NULL,

    CONSTRAINT "MovimientosInventario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MovimientosInventario" ADD CONSTRAINT "MovimientosInventario_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientosInventario" ADD CONSTRAINT "MovimientosInventario_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

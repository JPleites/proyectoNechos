-- AlterTable
ALTER TABLE "Pedidos" ADD COLUMN     "aprobado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SolicitudDescuento" (
    "id" SERIAL NOT NULL,
    "solicitudID" TEXT NOT NULL,
    "pedidoDetalleId" INTEGER NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "productoCodigo" TEXT NOT NULL,
    "vendedorCodigo" INTEGER NOT NULL,
    "precioLista" DECIMAL(65,30) NOT NULL,
    "costoVenta" DECIMAL(65,30) NOT NULL,
    "porcentajeSolicitado" DECIMAL(65,30) NOT NULL,
    "descuentoSolicitado" DECIMAL(65,30) NOT NULL,
    "precioFinal" DECIMAL(65,30) NOT NULL,
    "nivelAprobacion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "motivo" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aprobadoPorCodigo" INTEGER,

    CONSTRAINT "SolicitudDescuento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudDescuento_solicitudID_key" ON "SolicitudDescuento"("solicitudID");

-- AddForeignKey
ALTER TABLE "SolicitudDescuento" ADD CONSTRAINT "SolicitudDescuento_pedidoDetalleId_fkey" FOREIGN KEY ("pedidoDetalleId") REFERENCES "PedidoDetalle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDescuento" ADD CONSTRAINT "SolicitudDescuento_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDescuento" ADD CONSTRAINT "SolicitudDescuento_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDescuento" ADD CONSTRAINT "SolicitudDescuento_vendedorCodigo_fkey" FOREIGN KEY ("vendedorCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDescuento" ADD CONSTRAINT "SolicitudDescuento_aprobadoPorCodigo_fkey" FOREIGN KEY ("aprobadoPorCodigo") REFERENCES "Usuarios"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

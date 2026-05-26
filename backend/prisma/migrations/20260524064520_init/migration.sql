-- CreateTable
CREATE TABLE "Almacenes" (
    "id" SERIAL NOT NULL,
    "almacenID" TEXT NOT NULL,
    "almacen" TEXT NOT NULL,

    CONSTRAINT "Almacenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arqueo" (
    "id" SERIAL NOT NULL,
    "arqueoID" TEXT NOT NULL,
    "usuarioCodigo" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalEfectivo" DECIMAL(65,30) NOT NULL,
    "totalBac" DECIMAL(65,30) NOT NULL,
    "totalFicohsa" DECIMAL(65,30) NOT NULL,
    "totalDavivienda" DECIMAL(65,30) NOT NULL,
    "totalTransferencias" DECIMAL(65,30) NOT NULL,
    "totalRetiros" DECIMAL(65,30) NOT NULL,
    "totalDevoluciones" DECIMAL(65,30) NOT NULL,
    "totalFacturado" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Arqueo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "categoriaID" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cierres" (
    "id" SERIAL NOT NULL,
    "cierreID" TEXT NOT NULL,
    "usuarioCodigo" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalEfectivo" DECIMAL(65,30) NOT NULL,
    "totalBac" DECIMAL(65,30) NOT NULL,
    "totalFicohsa" DECIMAL(65,30) NOT NULL,
    "totalDavivienda" DECIMAL(65,30) NOT NULL,
    "totalTransferencias" DECIMAL(65,30) NOT NULL,
    "totalRetiros" DECIMAL(65,30) NOT NULL,
    "totalDevoluciones" DECIMAL(65,30) NOT NULL,
    "totalFacturado" DECIMAL(65,30) NOT NULL,
    "totalRecibido" DECIMAL(65,30) NOT NULL,
    "diferencia" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Cierres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clientes" (
    "id" SERIAL NOT NULL,
    "clienteID" TEXT NOT NULL,
    "rtn" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT,
    "telefono" TEXT,
    "direccion" TEXT NOT NULL,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devoluciones" (
    "id" SERIAL NOT NULL,
    "devolucionID" TEXT NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoCodigo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devoluciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventario" (
    "id" SERIAL NOT NULL,
    "productoCodigo" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "Inventario_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Pedidos" (
    "id" SERIAL NOT NULL,
    "pedidoID" TEXT NOT NULL,
    "clienteID" INTEGER,
    "usuarioCodigo" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "impuesto" DECIMAL(65,30) NOT NULL,
    "descuento" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoDetalle" (
    "id" SERIAL NOT NULL,
    "pedidoID" INTEGER NOT NULL,
    "productoCodigo" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PedidoDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" SERIAL NOT NULL,
    "dni" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaUltimoAscenso" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Productos" (
    "id" SERIAL NOT NULL,
    "productoID" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "producto" TEXT NOT NULL,
    "costoCompra" DECIMAL(65,30) NOT NULL,
    "costoVenta" DECIMAL(65,30) NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "descuento" DECIMAL(65,30) NOT NULL,
    "proveedor" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedores" (
    "id" SERIAL NOT NULL,
    "proveedorID" TEXT NOT NULL,
    "rtn" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,

    CONSTRAINT "Proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ubicaciones" (
    "ubicacion" TEXT NOT NULL,
    "deposito" INTEGER NOT NULL,
    "estante" INTEGER NOT NULL,
    "nivel" INTEGER NOT NULL,
    "almacenId" INTEGER NOT NULL,

    CONSTRAINT "Ubicaciones_pkey" PRIMARY KEY ("ubicacion")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "codigo" SERIAL NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "perfilId" INTEGER NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "CategoriaProveedores" (
    "categoriaId" INTEGER NOT NULL,
    "proveedorRtn" INTEGER NOT NULL,

    CONSTRAINT "CategoriaProveedores_pkey" PRIMARY KEY ("categoriaId","proveedorRtn")
);

-- CreateTable
CREATE TABLE "Ventas" (
    "id" SERIAL NOT NULL,
    "ventaID" TEXT NOT NULL,
    "clienteID" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    "tipoVenta" TEXT NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "impuesto" DECIMAL(65,30) NOT NULL,
    "descuento" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "totalRecibido" DECIMAL(65,30) NOT NULL,
    "cambio" DECIMAL(65,30) NOT NULL,
    "usuarioCodigo" INTEGER NOT NULL,

    CONSTRAINT "Ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaDetalle" (
    "id" SERIAL NOT NULL,
    "ventaID" INTEGER NOT NULL,
    "productoCodigo" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "descuento" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "VentaDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Almacenes_almacenID_key" ON "Almacenes"("almacenID");

-- CreateIndex
CREATE UNIQUE INDEX "Arqueo_arqueoID_key" ON "Arqueo"("arqueoID");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_categoriaID_key" ON "Categoria"("categoriaID");

-- CreateIndex
CREATE UNIQUE INDEX "Cierres_cierreID_key" ON "Cierres"("cierreID");

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_clienteID_key" ON "Clientes"("clienteID");

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_rtn_key" ON "Clientes"("rtn");

-- CreateIndex
CREATE UNIQUE INDEX "Devoluciones_devolucionID_key" ON "Devoluciones"("devolucionID");

-- CreateIndex
CREATE UNIQUE INDEX "Inventario_ubicacion_key" ON "Inventario"("ubicacion");

-- CreateIndex
CREATE UNIQUE INDEX "Pedidos_pedidoID_key" ON "Pedidos"("pedidoID");

-- CreateIndex
CREATE UNIQUE INDEX "Productos_productoID_key" ON "Productos"("productoID");

-- CreateIndex
CREATE UNIQUE INDEX "Productos_codigo_key" ON "Productos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedores_proveedorID_key" ON "Proveedores"("proveedorID");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedores_rtn_key" ON "Proveedores"("rtn");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_perfilId_key" ON "Usuarios"("perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "Ventas_ventaID_key" ON "Ventas"("ventaID");

-- AddForeignKey
ALTER TABLE "Arqueo" ADD CONSTRAINT "Arqueo_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cierres" ADD CONSTRAINT "Cierres_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devoluciones" ADD CONSTRAINT "Devoluciones_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devoluciones" ADD CONSTRAINT "Devoluciones_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_ubicacion_fkey" FOREIGN KEY ("ubicacion") REFERENCES "Ubicaciones"("ubicacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientosInventario" ADD CONSTRAINT "MovimientosInventario_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientosInventario" ADD CONSTRAINT "MovimientosInventario_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedidos" ADD CONSTRAINT "Pedidos_clienteID_fkey" FOREIGN KEY ("clienteID") REFERENCES "Clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedidos" ADD CONSTRAINT "Pedidos_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoDetalle" ADD CONSTRAINT "PedidoDetalle_pedidoID_fkey" FOREIGN KEY ("pedidoID") REFERENCES "Pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoDetalle" ADD CONSTRAINT "PedidoDetalle_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoDetalle" ADD CONSTRAINT "PedidoDetalle_ubicacion_fkey" FOREIGN KEY ("ubicacion") REFERENCES "Ubicaciones"("ubicacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productos" ADD CONSTRAINT "Productos_proveedor_fkey" FOREIGN KEY ("proveedor") REFERENCES "Proveedores"("rtn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ubicaciones" ADD CONSTRAINT "Ubicaciones_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaProveedores" ADD CONSTRAINT "CategoriaProveedores_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaProveedores" ADD CONSTRAINT "CategoriaProveedores_proveedorRtn_fkey" FOREIGN KEY ("proveedorRtn") REFERENCES "Proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ventas" ADD CONSTRAINT "Ventas_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ventas" ADD CONSTRAINT "Ventas_clienteID_fkey" FOREIGN KEY ("clienteID") REFERENCES "Clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDetalle" ADD CONSTRAINT "VentaDetalle_ventaID_fkey" FOREIGN KEY ("ventaID") REFERENCES "Ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDetalle" ADD CONSTRAINT "VentaDetalle_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

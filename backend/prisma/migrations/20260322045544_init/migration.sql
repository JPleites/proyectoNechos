-- CreateTable
CREATE TABLE "Clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Productos" (
    "codigo" TEXT NOT NULL,
    "producto" TEXT NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "descuento" INTEGER NOT NULL,
    "proveedor" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Productos_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "Inventario" (
    "id" SERIAL NOT NULL,
    "productoCodigo" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "ultimoMovimiento" TIMESTAMP(3) NOT NULL,
    "tipoMovimiento" TEXT NOT NULL,
    "ultimoUsuario" TEXT NOT NULL,

    CONSTRAINT "Inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Almacenes" (
    "id" TEXT NOT NULL,
    "almacen" TEXT NOT NULL,

    CONSTRAINT "Almacenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ubicaciones" (
    "ubicacion" TEXT NOT NULL,
    "estante" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,

    CONSTRAINT "Ubicaciones_pkey" PRIMARY KEY ("ubicacion")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedores" (
    "rtn" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,

    CONSTRAINT "Proveedores_pkey" PRIMARY KEY ("rtn")
);

-- CreateTable
CREATE TABLE "CategoriaProveedores" (
    "categoriaId" TEXT NOT NULL,
    "proveedorRtn" TEXT NOT NULL,

    CONSTRAINT "CategoriaProveedores_pkey" PRIMARY KEY ("categoriaId","proveedorRtn")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "codigo" SERIAL NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("codigo")
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
    "usuarioCodigo" INTEGER,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arqueo" (
    "id" SERIAL NOT NULL,
    "usuarioCodigo" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "TotalEfectivo" DOUBLE PRECISION NOT NULL,
    "totalBac" DOUBLE PRECISION NOT NULL,
    "totalFicohsa" DOUBLE PRECISION NOT NULL,
    "totalDavivienda" DOUBLE PRECISION NOT NULL,
    "totalTransferencias" DOUBLE PRECISION NOT NULL,
    "totalRetiros" DOUBLE PRECISION NOT NULL,
    "totalDevoluciones" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Arqueo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cierres" (
    "id" SERIAL NOT NULL,
    "usuarioCodigo" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "TotalEfectivo" DOUBLE PRECISION NOT NULL,
    "totalBac" DOUBLE PRECISION NOT NULL,
    "totalFicohsa" DOUBLE PRECISION NOT NULL,
    "totalDavivienda" DOUBLE PRECISION NOT NULL,
    "totalTransferencias" DOUBLE PRECISION NOT NULL,
    "totalRetiros" DOUBLE PRECISION NOT NULL,
    "totalDevoluciones" DOUBLE PRECISION NOT NULL,
    "totalFacturado" DOUBLE PRECISION NOT NULL,
    "totalRecibido" DOUBLE PRECISION NOT NULL,
    "diferencia" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Cierres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_correo_key" ON "Clientes"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_telefono_key" ON "Clientes"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Perfil_usuarioCodigo_key" ON "Perfil"("usuarioCodigo");

-- AddForeignKey
ALTER TABLE "Productos" ADD CONSTRAINT "Productos_proveedor_fkey" FOREIGN KEY ("proveedor") REFERENCES "Proveedores"("rtn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_productoCodigo_fkey" FOREIGN KEY ("productoCodigo") REFERENCES "Productos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_ubicacion_fkey" FOREIGN KEY ("ubicacion") REFERENCES "Ubicaciones"("ubicacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ubicaciones" ADD CONSTRAINT "Ubicaciones_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaProveedores" ADD CONSTRAINT "CategoriaProveedores_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaProveedores" ADD CONSTRAINT "CategoriaProveedores_proveedorRtn_fkey" FOREIGN KEY ("proveedorRtn") REFERENCES "Proveedores"("rtn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_usuarioCodigo_fkey" FOREIGN KEY ("usuarioCodigo") REFERENCES "Usuarios"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

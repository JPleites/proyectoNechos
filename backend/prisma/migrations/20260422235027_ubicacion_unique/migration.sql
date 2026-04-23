/*
  Warnings:

  - A unique constraint covering the columns `[ubicacion]` on the table `Inventario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Inventario_ubicacion_key" ON "Inventario"("ubicacion");
